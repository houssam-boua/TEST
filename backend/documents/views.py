import datetime
import json
import logging
import os

import jwt
import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status, viewsets, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.models import Departement, UserActionLog
from .models import (
    Document,
    DocumentArchive,
    DocumentCategory,
    DocumentNature,
    DocumentVersion,
    Folder,
)
from .serializers import (
    DocumentArchiveSerializer,
    DocumentCategorySerializer,
    DocumentNatureSerializer,
    DocumentSerializer,
    DocumentVersionSerializer,
    FolderSerializer,
)


# ------------------------ Helpers ------------------------

def _normalize_path(p: str) -> str:
    return (p or "").strip().strip("/").replace("\\", "/")


def _parse_iso_datetime(value):
    if not value:
        return None
    s = str(value).strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    
    try:
        dt = datetime.datetime.fromisoformat(s)
    except Exception:
        return None

    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


def _folder_is_archived_anywhere(folder: Folder) -> bool:
    cur = folder
    while cur:
        if getattr(cur, "is_archived", False):
            return True
        cur = getattr(cur, "parent_folder", None)
    return False


def _deny_if_archived_for_non_admin(request, document: Document):
    if getattr(document, "is_archived", False) and not (request.user and request.user.is_staff):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return None


def _restore_expired_entities():
    """
    Checks for Folders and Documents whose 'archived_until' has passed.
    Restores them to active status.
    """
    now = timezone.now()

    # 1. Find Expired Folders
    expired_folders = Folder.objects.filter(is_archived=True, archived_until__lte=now)
    
    if expired_folders.exists():
        with transaction.atomic():
            folder_ids = list(expired_folders.values_list("id", flat=True))
            
            # Restore folders
            Folder.objects.filter(id__in=folder_ids).update(
                is_archived=False,
                archived_at=None,
                archived_until=None,
                archived_by=None,
                archived_note=""
            )
            
            # Restore documents inside these folders (cascade restore)
            docs_in_folders = Document.objects.filter(parent_folder__id__in=folder_ids, is_archived=True)
            doc_ids_in_folders = list(docs_in_folders.values_list("id", flat=True))
            
            docs_in_folders.update(
                is_archived=False,
                archived_at=None,
                archived_until=None,
                archived_by=None,
                archive_note=""
            )

            if doc_ids_in_folders:
                DocumentArchive.objects.filter(
                    document_id__in=doc_ids_in_folders, 
                    status=DocumentArchive.STATUS_ACTIVE
                ).update(
                    status=DocumentArchive.STATUS_RESTORED,
                    restored_at=now
                )

    # 2. Find Expired Documents
    expired_docs = Document.objects.filter(is_archived=True, archived_until__lte=now)
    if expired_docs.exists():
        with transaction.atomic():
            doc_ids = list(expired_docs.values_list("id", flat=True))
            
            expired_docs.update(
                is_archived=False,
                archived_at=None,
                archived_until=None,
                archived_by=None,
                archive_note=""
            )

            DocumentArchive.objects.filter(
                document_id__in=doc_ids, 
                status=DocumentArchive.STATUS_ACTIVE
            ).update(
                status=DocumentArchive.STATUS_RESTORED,
                restored_at=now
            )


# ✅ NEW: S3 Move Helper
def _move_file_in_storage(old_path, new_path):
    """
    Moves a file in S3/MinIO by copying to new path and deleting old path.
    """
    if not old_path or not new_path or old_path == new_path:
        return
    
    try:
        if default_storage.exists(old_path):
            # Open the old file
            f = default_storage.open(old_path)
            # Save to new path
            default_storage.save(new_path, f)
            f.close()
            # Delete old file
            default_storage.delete(old_path)
    except Exception as e:
        print(f"Error moving file from {old_path} to {new_path}: {e}")


# ------------------------ NEW: Archive Browser ------------------------
class ArchiveNavigationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        _restore_expired_entities()

        folder_id = request.query_params.get("folder_id")

        if folder_id:
            parent = get_object_or_404(Folder, id=folder_id)
            folders = Folder.objects.filter(parent_folder=parent, is_archived=True)
            documents = Document.objects.filter(parent_folder=parent, is_archived=True)
            
            return Response({
                "current_folder": FolderSerializer(parent).data,
                "folders": FolderSerializer(folders, many=True).data,
                "documents": DocumentSerializer(documents, many=True).data
            })
        else:
            f_cond = Q(is_archived=True) & (Q(parent_folder__isnull=True) | Q(parent_folder__is_archived=False))
            folders = Folder.objects.filter(f_cond)

            d_cond = Q(is_archived=True) & Q(parent_folder__is_archived=False)
            documents = Document.objects.filter(d_cond)

            return Response({
                "current_folder": None,
                "folders": FolderSerializer(folders, many=True).data,
                "documents": DocumentSerializer(documents, many=True).data
            })


# ------------------------ UPDATED: Sync Folders & Docs ------------------------
class SyncFoldersView(APIView):
    """
    Checks DB folders and documents against S3. 
    If a folder or document is missing in S3, remove it from DB.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Sync Folders
        folders = Folder.objects.all()
        ids_to_delete_fol = []

        for folder in folders:
            path = folder.fol_path
            if not path: continue 
            
            # Check S3 existence (look for .keep or any content)
            exists = False
            try:
                keep_path = f"{path}/.keep"
                if default_storage.exists(keep_path):
                    exists = True
                else:
                    dirs, files = default_storage.listdir(path)
                    if dirs or files:
                        exists = True
            except Exception:
                # If S3 errors, safe to assume exists to prevent accidental deletion
                exists = True 
            
            if not exists:
                ids_to_delete_fol.append(folder.id)

        # 2. Sync Documents (✅ NEW LOGIC)
        documents = Document.objects.all()
        ids_to_delete_doc = []

        for doc in documents:
            # If doc has no path, it's invalid
            if not doc.doc_path or not doc.doc_path.name:
                ids_to_delete_doc.append(doc.id)
                continue
            
            # Check if file exists in S3
            try:
                if not default_storage.exists(doc.doc_path.name):
                    ids_to_delete_doc.append(doc.id)
            except Exception:
                # On error, skip
                pass

        # Execute Deletions
        del_fol_count = 0
        if ids_to_delete_fol:
            del_fol_count = len(ids_to_delete_fol)
            Folder.objects.filter(id__in=ids_to_delete_fol).delete()

        del_doc_count = 0
        if ids_to_delete_doc:
            del_doc_count = len(ids_to_delete_doc)
            Document.objects.filter(id__in=ids_to_delete_doc).delete()

        return Response({
            "status": "synced", 
            "deleted_ghost_folders": del_fol_count,
            "deleted_ghost_documents": del_doc_count
        })


# ------------------------ Folders ------------------------
class FolderViewSet(viewsets.ModelViewSet):
    queryset = (
        Folder.objects.select_related("parent_folder", "created_by", "archived_by")
        .prefetch_related("subfolders")
        .all()
    )
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["fol_index", "parent_folder", "is_archived"]
    search_fields = ["fol_name", "fol_path"]
    ordering_fields = ["fol_name", "fol_index", "created_at", "updated_at"]
    ordering = ["fol_index", "fol_name"]

    def get_queryset(self):
        return super().get_queryset().filter(is_archived=False)

    def perform_create(self, serializer):
        folder_data = serializer.validated_data
        fol_index = folder_data.get("fol_index")
        parent_folder = folder_data.get("parent_folder")

        if parent_folder and _folder_is_archived_anywhere(parent_folder):
            raise ValidationError({"parent_folder": "Cannot create a folder under an archived folder."})

        folder = serializer.save(created_by=self.request.user)

        if fol_index == "PR":
            siblings = Folder.objects.filter(parent_folder=parent_folder, fol_index="PR").order_by("id")
            folder.fol_order = siblings.count()
            folder.save(update_fields=["fol_order"])

        self._update_folder_path(folder)

        # ✅ FIX: Create .keep file in S3 for sync visibility
        try:
            default_storage.save(f"{folder.fol_path}/.keep", ContentFile(b""))
        except Exception:
            pass

    # ✅ Handle Folder Move/Rename (Recursive Update)
    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_path = old_instance.fol_path
        
        folder = serializer.save()
        
        # Calculate new path
        self._update_folder_path(folder)
        new_path = folder.fol_path

        # If path changed, we must move contents recursively
        if old_path and new_path and old_path != new_path:
            self._recursive_move(old_path, new_path, folder)

    def _update_folder_path(self, folder):
        parent_path = ""
        if folder.parent_folder:
            parent_path = _normalize_path(folder.parent_folder.fol_path)
        
        folder_name = _normalize_path(folder.fol_name)
        full_path = f"{parent_path}/{folder_name}" if parent_path else folder_name
        
        if folder.fol_path != full_path:
            folder.fol_path = full_path
            folder.save(update_fields=["fol_path"])

    def _recursive_move(self, old_prefix, new_prefix, folder):
        # 1. Update Documents in this folder (S3 Move + DB Update)
        documents = Document.objects.filter(parent_folder=folder)
        for doc in documents:
            old_doc_path = str(doc.doc_path)
            # Replace prefix
            if old_doc_path.startswith(old_prefix):
                # Construct new path preserving filename
                suffix = old_doc_path[len(old_prefix):].lstrip('/')
                new_doc_path = f"{new_prefix}/{suffix}"
                
                # Move in S3
                _move_file_in_storage(old_doc_path, new_doc_path)
                
                # Update DB
                doc.doc_path.name = new_doc_path
                doc.save(update_fields=["doc_path"])

        # 2. Update Subfolders
        subfolders = Folder.objects.filter(parent_folder=folder)
        for sub in subfolders:
            old_sub_path = sub.fol_path
            
            # Recalculate subfolder path based on new parent path
            sub_name = _normalize_path(sub.fol_name)
            new_sub_path = f"{new_prefix}/{sub_name}"
            
            sub.fol_path = new_sub_path
            sub.save(update_fields=["fol_path"])
            
            # Recurse
            self._recursive_move(old_sub, new_sub, sub)

    @action(detail=False, methods=["get"], url_path="roots")
    def roots(self, request):
        _restore_expired_entities()
        roots = self.get_queryset().filter(parent_folder=None)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="tree")
    def tree(self, request):
        _restore_expired_entities()

        def build_tree(parent, parent_path_index=None):
            children = parent.subfolders.filter(is_archived=False)

            if parent.fol_order is not None:
                formatted_order = f"0{parent.fol_order}" if parent.fol_order < 10 else str(parent.fol_order)
                current_part = f"{parent.fol_index}-{formatted_order}"
            else:
                current_part = parent.fol_index

            path_index = f"{parent_path_index}-{current_part}" if parent_path_index else current_part

            return {
                "id": parent.id,
                "fol_name": parent.fol_name,
                "fol_path": parent.fol_path,
                "fol_index": parent.fol_index,
                "fol_order": parent.fol_order,
                "path_index": path_index,
                "is_archived": getattr(parent, "is_archived", False),
                "archived_at": getattr(parent, "archived_at", None),
                "archived_until": getattr(parent, "archived_until", None),
                "archived_by": getattr(parent, "archived_by_id", None),
                "created_by": parent.created_by_id,
                "created_at": parent.created_at,
                "updated_at": parent.updated_at,
                "subfolders": [build_tree(child, path_index) for child in children],
            }

        roots = self.get_queryset().filter(parent_folder=None)
        tree = [build_tree(folder) for folder in roots]
        return Response(tree)

    def _descendant_folder_ids(self, root: Folder):
        ids = []
        stack = [root]
        while stack:
            node = stack.pop()
            ids.append(node.id)
            stack.extend(list(node.subfolders.all()))
        return ids

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser], url_path="archive")
    def archive(self, request, pk=None):
        folder = get_object_or_404(Folder.objects.all(), pk=pk)

        mode = (request.data.get("mode") or "").strip().lower()
        until_raw = request.data.get("until")
        note = (request.data.get("note") or "").strip()

        if mode not in ("permanent", "until"):
            return Response({"detail": "mode must be 'permanent' or 'until'."}, status=status.HTTP_400_BAD_REQUEST)

        archived_until = _parse_iso_datetime(until_raw) if mode == "until" else None
        now = timezone.now()
        folder_ids = self._descendant_folder_ids(folder)

        with transaction.atomic():
            Folder.objects.filter(id__in=folder_ids).update(
                is_archived=True,
                archived_at=now,
                archived_until=archived_until,
                archived_by=request.user,
                archived_note=note
            )

            docs_qs = Document.objects.filter(parent_folder_id__in=folder_ids, is_archived=False)
            docs_ids = list(docs_qs.values_list("id", flat=True))
            if docs_ids:
                records = [
                    DocumentArchive(
                        document_id=doc_id,
                        archived_by=request.user,
                        archived_at=now,
                        retention_until=archived_until,
                        status=DocumentArchive.STATUS_ACTIVE,
                        note=note or f"Folder archive: {folder.fol_name}",
                    )
                    for doc_id in docs_ids
                ]
                DocumentArchive.objects.bulk_create(records)

            docs_qs.update(
                is_archived=True,
                archived_at=now,
                archived_until=archived_until,
                archived_by=request.user,
                archive_note=note
            )

            UserActionLog.objects.create(
                user=request.user,
                action="archive_folder",
                content_type=ContentType.objects.get_for_model(Folder),
                object_id=folder.id,
                extra_info={"folders_count": len(folder_ids), "docs_count": len(docs_ids)}
            )

        return Response(
            {
                "ok": True,
                "folder_id": folder.id,
                "affected_folders": len(folder_ids),
                "affected_documents": len(docs_ids),
                "archived_until": archived_until,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser], url_path="restore")
    def restore(self, request, pk=None):
        folder = get_object_or_404(Folder.objects.all(), pk=pk)
        now = timezone.now()
        folder_ids = self._descendant_folder_ids(folder)

        with transaction.atomic():
            Folder.objects.filter(id__in=folder_ids).update(
                is_archived=False,
                archived_at=None,
                archived_until=None,
                archived_by=None,
                archived_note=""
            )

            docs_qs = Document.objects.filter(parent_folder_id__in=folder_ids, is_archived=True)
            doc_ids = list(docs_qs.values_list("id", flat=True))

            docs_qs.update(
                is_archived=False,
                archived_at=None,
                archived_until=None,
                archived_by=None,
                archive_note=""
            )

            if doc_ids:
                DocumentArchive.objects.filter(
                    document_id__in=doc_ids,
                    status=DocumentArchive.STATUS_ACTIVE,
                ).update(
                    status=DocumentArchive.STATUS_RESTORED,
                    restored_at=now,
                )
            
            UserActionLog.objects.create(
                user=request.user,
                action="restore_folder",
                content_type=ContentType.objects.get_for_model(Folder),
                object_id=folder.id,
                extra_info={"folders_count": len(folder_ids)}
            )

        return Response(
            {
                "ok": True,
                "folder_id": folder.id,
                "restored_folders": len(folder_ids),
                "restored_documents": len(doc_ids),
            },
            status=status.HTTP_200_OK,
        )


# ------------------------ Dictionaries ------------------------
class DocumentCategoryViewSet(viewsets.ModelViewSet):
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [IsAuthenticated]


class DocumentNatureViewSet(viewsets.ModelViewSet):
    queryset = DocumentNature.objects.all()
    serializer_class = DocumentNatureSerializer
    permission_classes = [IsAuthenticated]


# ------------------------ Documents ViewSet (Actions) ------------------------
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(is_archived=False)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsAdminUser],
        url_path="archive",
    )
    def archive(self, request, pk=None):
        document = get_object_or_404(Document.objects.all(), pk=pk)

        mode = (request.data.get("mode") or "").strip().lower()
        until_raw = request.data.get("until")
        note = request.data.get("note") or ""

        if mode not in ("permanent", "until"):
            return Response(
                {"detail": "mode must be 'permanent' or 'until'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        retention_until = None
        if mode == "until":
            retention_until = _parse_iso_datetime(until_raw)
            if not retention_until:
                return Response(
                    {"detail": "Invalid or missing 'until' datetime."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if document.is_archived:
            return Response(
                {"detail": "Document is already archived."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            document.is_archived = True
            document.archived_at = timezone.now()
            document.archived_until = retention_until
            document.archived_by = request.user
            document.archive_note = note
            document.save(update_fields=["is_archived", "archived_at", "archived_until", "archived_by", "archive_note"])

            DocumentArchive.objects.filter(document=document, status=DocumentArchive.STATUS_ACTIVE).update(
                status=DocumentArchive.STATUS_EXPIRED
            )

            record = DocumentArchive.objects.create(
                document=document,
                archived_by=request.user,
                archived_at=timezone.now(),
                retention_until=retention_until,
                status=DocumentArchive.STATUS_ACTIVE,
                note=note,
            )

            UserActionLog.objects.create(
                user=request.user,
                action="archive",
                content_type=ContentType.objects.get_for_model(Document),
                object_id=document.id,
                extra_info={"mode": mode, "retention_until": str(retention_until) if retention_until else None},
            )

        return Response(
            {"message": "Document archived successfully", "archive": DocumentArchiveSerializer(record).data},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsAdminUser],
        url_path="restore",
    )
    def restore(self, request, pk=None):
        document = get_object_or_404(Document.objects.all(), pk=pk)

        if not document.is_archived:
            return Response({"detail": "Document is not archived."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            document.is_archived = False
            document.archived_until = None
            document.archive_note = ""
            document.save(update_fields=["is_archived", "archived_until", "archive_note"])

            active = (
                DocumentArchive.objects.filter(document=document, status=DocumentArchive.STATUS_ACTIVE)
                .order_by("-archived_at")
                .first()
            )
            if active:
                active.status = DocumentArchive.STATUS_RESTORED
                active.restored_at = timezone.now()
                active.save(update_fields=["status", "restored_at"])

            UserActionLog.objects.create(
                user=request.user,
                action="restore",
                content_type=ContentType.objects.get_for_model(Document),
                object_id=document.id,
                extra_info={},
            )

        return Response({"message": "Document restored successfully"}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated, IsAdminUser],
        url_path="archived",
    )
    def archived(self, request):
        _restore_expired_entities()
        qs = (
            DocumentArchive.objects.select_related("document", "archived_by")
            .filter(status=DocumentArchive.STATUS_ACTIVE)
            .order_by("-archived_at")
        )
        return Response(DocumentArchiveSerializer(qs, many=True).data, status=status.HTTP_200_OK)


class DocumentArchiveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentArchive.objects.select_related("document", "archived_by").all()
    serializer_class = DocumentArchiveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["note", "document__doc_title", "document__doc_code"]
    ordering_fields = ["archived_at", "retention_until", "status"]
    ordering = ["-archived_at"]


# ------------------------ Documents (APIView) ------------------------
class DocumentListCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        custom_path = (request.data.get("doc_path") or "").strip()

        format_and_types = {
            "pdf": "PDF",
            "docx": "Word Document",
            "xlsx": "Excel Spreadsheet",
            "csv": "CSV File",
            "txt": "Text File",
            "png": "PNG Image",
            "jpg": "JPEG Image",
            "jpeg": "JPEG Image",
        }

        if not file:
            return Response({"error": "Missing field: file"}, status=400)

        parent_folder_id = request.data.get("parent_folder")
        try:
            folder = Folder.objects.get(id=parent_folder_id)
        except Folder.DoesNotExist:
            return Response({"error": "Invalid folder ID"}, status=400)

        if _folder_is_archived_anywhere(folder):
            return Response({"error": "This folder (or a parent folder) is archived."}, status=400)

        owner_id = request.data.get("doc_owner")
        owner = None
        if owner_id:
            try:
                owner = get_user_model().objects.get(id=owner_id)
            except get_user_model().DoesNotExist:
                return Response({"error": "Invalid owner ID"}, status=400)
        else:
            owner = request.user if request.user and request.user.is_authenticated else None
            if not owner:
                return Response({"error": "Missing field: doc_owner"}, status=400)

        departement_id = request.data.get("doc_departement")
        try:
            departement = Departement.objects.get(id=departement_id)
        except Departement.DoesNotExist:
            return Response({"error": "Invalid departement ID"}, status=400)

        nature_id = request.data.get("doc_nature")
        try:
            nature = DocumentNature.objects.get(id=nature_id)
        except DocumentNature.DoesNotExist:
            return Response({"error": "Invalid nature ID"}, status=400)

        last_order = Document.objects.filter(doc_nature=nature).order_by("-doc_nature_order").first()
        next_order = (last_order.doc_nature_order + 1) if last_order and last_order.doc_nature_order is not None else 1

        doc_size = file.size
        doc_format = file.name.split(".")[-1] if "." in file.name else ""
        doc_title = request.data.get("doc_title", "")
        doc_status_type = request.data.get("doc_status_type", request.data.get("doc_status", "draft"))
        doc_description_val = request.data.get("doc_description", "")
        doc_code = f"{nature.code}-{next_order}"

        safe_name = os.path.basename(file.name)

        # ✅ FIX: Construct LIVE path based on folder structure
        # If custom path is provided, use it, else build from folder.fol_path
        if custom_path:
            base = _normalize_path(custom_path)
        else:
            base = _normalize_path(folder.fol_path or "")

        upload_path = f"{base}/{safe_name}" if base else safe_name
        upload_path = upload_path.replace("\\", "/")

        document = Document(
            doc_title=doc_title,
            doc_type=format_and_types.get(doc_format.lower(), "Unknown"),
            doc_status_type=doc_status_type,
            doc_owner=owner,
            doc_departement=departement,
            doc_format=doc_format,
            doc_code=doc_code,
            doc_size=doc_size,
            doc_description=doc_description_val,
            doc_nature=nature,
            doc_nature_order=next_order,
            parent_folder=folder,
        )

        # Save the LIVE file (at "Folder/Filename.ext")
        document.doc_path.save(upload_path, file, save=False)
        document.save()

        # Create a SAFE COPY for V1 in history
        try:
            file.seek(0)
        except Exception:
            pass

        v1 = DocumentVersion.objects.create(
            document=document,
            version_number=1,
            change_type="AUDITABLE",
            version_comment="Initial version",
        )
        # ✅ FIX: Save version in "documents/versions/" explicitly (via model upload_to)
        # Note: Model definition handles the prefix, we just give the name.
        v1_name = f"{document.id}/v1_{safe_name}".replace("\\", "/")
        v1.version_path.save(v1_name, file)

        UserActionLog.objects.create(
            user=owner,
            action="create",
            content_type=ContentType.objects.get_for_model(document),
            object_id=document.id,
            extra_info={"doc_title": doc_title},
        )

        serializer = DocumentSerializer(document)
        return Response(
            {"message": "Document uploaded successfully", "document": serializer.data},
            status=201,
        )

    def get(self, request):
        _restore_expired_entities()

        folder = (request.query_params.get("folder") or "").strip()
        if folder:
            folder = _normalize_path(folder)
            prefix = f"{folder}/" if not folder.endswith("/") else folder
            docs = Document.objects.filter(doc_path__startswith=prefix, is_archived=False)
            return Response(DocumentSerializer(docs, many=True).data)

        documents = Document.objects.filter(is_archived=False)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)


class DocumentDetailView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        denied = _deny_if_archived_for_non_admin(request, document)
        if denied:
            return denied
        serializer = DocumentSerializer(document)
        return Response(serializer.data)

    def put(self, request, pk):
        return self.handle_update(request, pk)

    def patch(self, request, pk):
        return self.handle_update(request, pk)

    def handle_update(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        
        # Check permissions
        denied = _deny_if_archived_for_non_admin(request, document)
        if denied: return denied

        # ✅ Check for Move (Parent Change)
        old_path = str(document.doc_path)
        new_parent_id = request.data.get("parent_folder")
        
        if new_parent_id is not None:
            # Normalize ID: empty string means root
            new_parent_id = None if new_parent_id == "" else new_parent_id
            
            new_folder = None
            new_path_prefix = ""
            
            if new_parent_id:
                new_folder = get_object_or_404(Folder, id=new_parent_id)
                new_path_prefix = _normalize_path(new_folder.fol_path)
            
            # Construct new S3 key
            filename = os.path.basename(old_path)
            new_key = f"{new_path_prefix}/{filename}" if new_path_prefix else filename
            new_key = _normalize_path(new_key)

            if old_path != new_key:
                # Move in S3
                _move_file_in_storage(old_path, new_key)
                # Update DB field manually to prevent serializer overwriting with old
                document.doc_path.name = new_key
                document.save(update_fields=["doc_path"])

        # Continue with standard update logic (versions, metadata)
        uploaded = request.FILES.get("file")
        update_type = (request.data.get("update_type") or "AUDITABLE").upper().strip()
        if update_type not in ("MINOR", "AUDITABLE", "SILENT"):
            update_type = "AUDITABLE"
        version_comment = request.data.get("version_comment") or ""

        with transaction.atomic():
            # Handle File Update (Versioning)
            if uploaded or update_type != "SILENT":
                last_v = document.versions.order_by("-version_number").first()
                if last_v is None: # Create initial v1 if missing
                    v1 = DocumentVersion.objects.create(
                        document=document, version_number=1, change_type="AUDITABLE", version_comment="Initial"
                    )
                    # Try to save content if file exists
                    try: 
                        if default_storage.exists(document.doc_path.name):
                            f = default_storage.open(document.doc_path.name)
                            v1.version_path.save(f"v1_{os.path.basename(document.doc_path.name)}", f)
                    except: pass
                    last_v = v1

                next_ver = (last_v.version_number + 1) if last_v else 1

                if update_type == "MINOR" and uploaded:
                    # New version logic
                    safe_name = os.path.basename(uploaded.name)
                    v = DocumentVersion.objects.create(
                        document=document, version_number=next_ver, change_type="MINOR", version_comment=version_comment
                    )
                    # Save version to version folder
                    v.version_path.save(f"{document.id}/v{next_ver}_{safe_name}", uploaded)
                    
                    # Reset stream for main save
                    uploaded.seek(0)
                    
                    # ✅ FIX: Update live file at the correct folder path
                    folder_path = _normalize_path(document.parent_folder.fol_path)
                    live_key = f"{folder_path}/{safe_name}"
                    
                    # If name changed, delete old file first
                    if document.doc_path.name != live_key:
                         default_storage.delete(document.doc_path.name)

                    document.doc_path.save(live_key, uploaded)
                    document.doc_size = uploaded.size
                    
                    ext = os.path.splitext(safe_name)[1].lstrip(".").lower()
                    if ext: 
                        document.doc_format = ext
                        document.doc_type = ext.upper()

                elif update_type == "AUDITABLE":
                    # Metadata only update -> Link to old file
                    v = DocumentVersion.objects.create(
                        document=document, version_number=next_ver, change_type="AUDITABLE", version_comment=version_comment
                    )
                    if last_v and last_v.version_path:
                        v.version_path.name = last_v.version_path.name
                        v.save(update_fields=["version_path"])

            # Save Metadata
            # Filter out fields we handled manually
            data = request.data.copy()
            data.pop("file", None)
            data.pop("doc_path", None) 
            data.pop("update_type", None)
            data.pop("version_comment", None)

            serializer = DocumentSerializer(document, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Log action
                UserActionLog.objects.create(
                    user=document.doc_owner,
                    action="update",
                    content_type=ContentType.objects.get_for_model(document),
                    object_id=document.id,
                    extra_info={"updated_fields": list(data.keys())}
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        denied = _deny_if_archived_for_non_admin(request, document)
        if denied:
            return denied

        owner = document.doc_owner
        doc_id = document.id
        document.delete()

        UserActionLog.objects.create(
            user=owner,
            action="delete",
            content_type=ContentType.objects.get_for_model(Document),
            object_id=doc_id,
            extra_info={"doc_title": getattr(document, "doc_title", None)},
        )
        return Response({"status": "Document deleted successfully"}, status=200)


class DocumentVersionViewSet(viewsets.ModelViewSet):
    queryset = DocumentVersion.objects.all()
    serializer_class = DocumentVersionSerializer
    permission_classes = [IsAuthenticated]


class MinioFileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        def get_all_directories(path=""):
            directories, _files = default_storage.listdir(path)
            all_dirs = []
            for dir_name in directories:
                full_path = f"{path}/{dir_name}".lstrip("/")
                all_dirs.append(full_path)
                all_dirs.extend(get_all_directories(full_path))
            return all_dirs

        return Response({"folders": get_all_directories()}, status=status.HTTP_200_OK)


class FolderDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        folder = request.query_params.get("folder", "").strip()
        if not folder:
            return Response(
                {"error": "Missing folder query parameter. Use ?folder=path/to/folder"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        folder = _normalize_path(folder)
        prefix = f"{folder}/" if not folder.endswith("/") else folder

        documents = Document.objects.filter(doc_path__startswith=prefix, is_archived=False)
        serializer = DocumentSerializer(documents, many=True)
        return Response({"folder": folder, "documents": serializer.data}, status=status.HTTP_200_OK)


class DocumentByFolderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, folder_id):
        folder = get_object_or_404(Folder, id=folder_id)
        documents = Document.objects.filter(parent_folder=folder, is_archived=False)
        serializer = DocumentSerializer(documents, many=True)
        return Response({"folder": folder.fol_name, "documents": serializer.data}, status=status.HTTP_200_OK)


# ---------------- OnlyOffice ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def onlyoffice_config(request, pk):
    document = get_object_or_404(Document, pk=pk)
    denied = _deny_if_archived_for_non_admin(request, document)
    if denied:
        return denied

    try:
        file_path = getattr(document.doc_path, "name", str(document.doc_path))
    except Exception:
        file_path = str(document.doc_path)

    try:
        file_url = default_storage.url(file_path)
    except Exception:
        file_url = request.build_absolute_uri(f"/media/{file_path}")

    doc_key = f"{document.id}-{int(document.updated_at.timestamp())}"

    callback_host = os.getenv("ONLYOFFICE_CALLBACK_HOST")
    if callback_host:
        if callback_host.startswith("http://") or callback_host.startswith("https://"):
            callback_url = f"{callback_host.rstrip('/')}/api/documents/{document.id}/onlyoffice-callback/"
        else:
            callback_url = f"http://{callback_host.rstrip('/')}/api/documents/{document.id}/onlyoffice-callback/"
    else:
        callback_url = request.build_absolute_uri(f"/api/documents/{document.id}/onlyoffice-callback/")

    config = {
        "document": {
            "title": document.doc_title,
            "url": file_url,
            "fileType": (document.doc_format or "").lower(),
            "key": doc_key,
        },
        "editorConfig": {
            "mode": "edit",
            "callbackUrl": callback_url,
            "user": {
                "id": str(request.user.id) if request.user.is_authenticated else "anon",
                "name": request.user.get_full_name() if request.user.is_authenticated else "Guest",
            },
            "customization": {
                "forcesave": False,
                "hideRightMenu": True,
                "compactHeader": True,
            },
        },
    }

    secret = (
        getattr(settings, "ONLYOFFICE_JWT_SECRET", None)
        or os.getenv("ONLYOFFICE_JWT_SECRET")
        or os.getenv("ONLYOFFICE_SECRET")
    )
    if secret:
        try:
            exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
            token_payload = {
                "document": config.get("document"),
                "editorConfig": config.get("editorConfig"),
                "exp": exp,
            }
            token = jwt.encode(token_payload, secret, algorithm="HS256")
            config["token"] = token
            config["document"]["token"] = token
        except Exception as exc:
            print(f"ONLYOFFICE: token signing failed: {exc}")

    return Response(config)


@api_view(["GET"])
@permission_classes([AllowAny])
def onlyoffice_script_proxy(request):
    docserver = os.getenv("ONLYOFFICE_URL") or os.getenv("VITE_ONLYOFFICE_URL") or "http://localhost:8080"
    script_url = f"{docserver.rstrip('/')}/web-apps/apps/api/documents/api.js"

    try:
        r = requests.get(script_url, timeout=10)
    except Exception as exc:
        return Response({"error": f"Failed to fetch script from Document Server: {exc}"}, status=502)

    if r.status_code != 200:
        return Response({"error": f"Document Server returned {r.status_code}"}, status=502)

    resp = HttpResponse(r.content, content_type="application/javascript")
    resp["Access-Control-Allow-Origin"] = "*"
    resp["Cache-Control"] = "public, max-age=3600"
    return resp


class DocumentVersionsByDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        denied = _deny_if_archived_for_non_admin(request, document)
        if denied:
            return denied

        qs = DocumentVersion.objects.filter(document=document).order_by("-version_number")
        serializer = DocumentVersionSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def onlyoffice_callback(request, pk):
    logger = logging.getLogger(__name__)

    try:
        raw_body = request.body.decode("utf-8") if hasattr(request, "body") else ""
    except Exception:
        raw_body = "<unreadable>"

    data = request.data if hasattr(request, "data") else {}
    client_addr = request.META.get("REMOTE_ADDR")

    log_entry = {
        "time": datetime.datetime.utcnow().isoformat(),
        "client": client_addr,
        "path": request.path,
        "headers": {k: v for k, v in request.META.items() if k.startswith("HTTP_")},
        "raw_body": raw_body,
        "parsed": data,
    }

    try:
        logger.info("ONLYOFFICE CALLBACK: %s", json.dumps(log_entry))
    except Exception:
        logger.exception("Failed to log onlyoffice callback payload")

    log_file = os.getenv("ONLYOFFICE_CALLBACK_LOG_FILE")
    if log_file:
        try:
            with open(log_file, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(log_entry) + "\n")
        except Exception:
            logger.exception("Failed to write onlyoffice callback log file")

    status_code = data.get("status")
    if status_code in (2, 3, 4, "2", "3", "4"):
        download_url = data.get("url") or data.get("downloadUri")
        if not download_url:
            logger.error("OnlyOffice callback: no download url provided in payload")
            return Response({"error": 1, "message": "no download url"})

        try:
            head = requests.head(download_url, allow_redirects=True, timeout=10)
            logger.info("OnlyOffice callback HEAD %s -> %s", download_url, head.status_code)
        except Exception:
            logger.exception("HEAD to download URL failed; will attempt GET")

        try:
            r = requests.get(download_url, stream=True, timeout=30)
            logger.info(
                "OnlyOffice callback GET %s -> %s (len=%s)",
                download_url,
                r.status_code,
                r.headers.get("Content-Length"),
            )
            if r.status_code != 200:
                logger.error("OnlyOffice callback: download GET returned %s", r.status_code)
                return Response({"error": 1, "message": f"download status {r.status_code}"})

            with transaction.atomic():
                document = get_object_or_404(Document, pk=pk)

                # If archived, ignore callback to avoid modifying archived documents
                if document.is_archived:
                    logger.warning("OnlyOffice callback: document %s is archived; ignoring save.", pk)
                    return Response({"error": 0})

                last_v = document.versions.order_by("-version_number").first()
                if last_v is None and getattr(document.doc_path, "name", ""):
                    try:
                        f_content = document.doc_path.read()
                    except Exception:
                        f_content = b""

                    initial = DocumentVersion.objects.create(
                        document=document,
                        version_number=1,
                        change_type="AUDITABLE",
                        version_comment="Initial version",
                    )
                    v1_name = f"{document.id}/v1_initial.bin"
                    initial.version_path.save(v1_name, ContentFile(f_content))
                    last_v = initial

                next_version = (last_v.version_number + 1) if last_v else 1

                # Save history version (Safe Copy)
                current_name = os.path.basename(getattr(document.doc_path, "name", "") or f"document_{document.id}.bin")
                v = DocumentVersion.objects.create(
                    document=document,
                    version_number=next_version,
                    change_type="AUDITABLE",
                    version_comment="ONLYOFFICE edit",
                )
                version_name = f"{document.id}/v{next_version}_{current_name}".replace("\\", "/")
                v.version_path.save(version_name, ContentFile(r.content), save=True)

                # Overwrite current file in folder path
                fol_path = _normalize_path(getattr(document.parent_folder, "fol_path", "") or "")
                current_key = f"{fol_path}/{current_name}" if fol_path else current_name
                document.doc_path.save(current_key, ContentFile(r.content), save=True)

            logger.info("OnlyOffice callback: saved new version for document %s", pk)
            return Response({"error": 0})

        except Exception as exc:
            logger.exception("OnlyOffice callback: error downloading/saving file: %s", exc)
            return Response({"error": 1, "message": str(exc)})

    return Response({"error": 0})