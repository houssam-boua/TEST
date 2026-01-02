# views.py
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
    """
    Accepts:
      - None
      - ISO string: "2026-01-02T01:00:00" or "...Z"
    Returns timezone-aware datetime or None.
    """
    if not value:
        return None
    s = str(value).strip()
    # Handle Zulu "Z" manually if needed
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
    """
    If any ancestor is archived, the folder is effectively archived.
    """
    cur = folder
    while cur:
        if getattr(cur, "is_archived", False):
            return True
        cur = getattr(cur, "parent_folder", None)
    return False


def _deny_if_archived_for_non_admin(request, document: Document):
    """
    Archived documents must only be visible to admins.
    """
    if getattr(document, "is_archived", False) and not (request.user and request.user.is_staff):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return None


# ------------------------ NEW: Archive Browser ------------------------
class ArchiveNavigationView(APIView):
    """
    Smart Navigation for Archives [Hierarchical View].
    GET /api/archives/navigation/?folder_id=...
    
    - If folder_id is missing: Returns "Root" archived items (Archived items whose parents are Active).
    - If folder_id is provided: Returns contents of that specific archived folder.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        folder_id = request.query_params.get("folder_id")

        if folder_id:
            # --- Browse inside an archived folder ---
            parent = get_object_or_404(Folder, id=folder_id)
            
            # Fetch contents (both must be archived if parent is archived)
            folders = Folder.objects.filter(parent_folder=parent, is_archived=True)
            documents = Document.objects.filter(parent_folder=parent, is_archived=True)
            
            return Response({
                "current_folder": FolderSerializer(parent).data,
                "folders": FolderSerializer(folders, many=True).data,
                "documents": DocumentSerializer(documents, many=True).data
            })
        else:
            # --- Root of Archive View ---
            # Show items that are explicitly Archived, but live in an Active location.
            # This filters out the "children" of archived folders to prevent clutter at the root level.
            
            # Folders: Archived AND (No Parent OR Parent is Active)
            f_cond = Q(is_archived=True) & (Q(parent_folder__isnull=True) | Q(parent_folder__is_archived=False))
            folders = Folder.objects.filter(f_cond)

            # Documents: Archived AND Parent is Active
            d_cond = Q(is_archived=True) & Q(parent_folder__is_archived=False)
            documents = Document.objects.filter(d_cond)

            return Response({
                "current_folder": None,
                "folders": FolderSerializer(folders, many=True).data,
                "documents": DocumentSerializer(documents, many=True).data
            })


# ------------------------ Folders ------------------------
class FolderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing folders.
    Provides CRUD operations, search, ordering, and hierarchical views for Folder objects.
    """
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
        # By default, hide archived folders from standard views
        return super().get_queryset().filter(is_archived=False)

    def perform_create(self, serializer):
        folder_data = serializer.validated_data
        fol_index = folder_data.get("fol_index")
        parent_folder = folder_data.get("parent_folder")

        # Prevent creating inside an archived folder tree
        if parent_folder and _folder_is_archived_anywhere(parent_folder):
            raise ValidationError({"parent_folder": "Cannot create a folder under an archived folder."})

        folder = serializer.save(created_by=self.request.user)

        # Auto order for PR folders
        if fol_index == "PR":
            siblings = Folder.objects.filter(parent_folder=parent_folder, fol_index="PR").order_by("id")
            folder.fol_order = siblings.count()
            folder.save(update_fields=["fol_order"])

        # Build the full path: parent path + current folder name
        parent_path = ""
        if folder.parent_folder:
            parent_path = _normalize_path(folder.parent_folder.fol_path)

        folder_name = _normalize_path(folder.fol_name)
        full_path = f"{parent_path}/{folder_name}" if parent_path else folder_name

        if folder.fol_path != full_path:
            folder.fol_path = full_path
            folder.save(update_fields=["fol_path"])

        # Create a logical folder in MinIO/S3 by storing a placeholder
        placeholder_path = f"{full_path}/.keep" if full_path else ".keep"
        try:
            default_storage.save(placeholder_path, ContentFile(b""))
        except Exception:
            pass

    @action(detail=False, methods=["get"], url_path="roots")
    def roots(self, request):
        roots = self.get_queryset().filter(parent_folder=None)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="tree")
    def tree(self, request):
        def build_tree(parent, parent_path_index=None):
            # Only fetch non-archived subfolders
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
        """
        Return all descendant folder ids including root.
        """
        ids = []
        stack = [root]
        while stack:
            node = stack.pop()
            ids.append(node.id)
            # Fetch subfolders including archived ones for restoration/archive recursion
            stack.extend(list(node.subfolders.all()))
        return ids

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser], url_path="archive")
    def archive(self, request, pk=None):
        """
        Archive this folder, all subfolders, and all documents inside.
        """
        # Use Folder.objects.all() to find it even if is_archived=False filter is on queryset
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
            # Update folders
            Folder.objects.filter(id__in=folder_ids).update(
                is_archived=True,
                archived_at=now,
                archived_until=archived_until,
                archived_by=request.user,
            )

            # Archive documents in this folder subtree
            docs_qs = Document.objects.filter(parent_folder_id__in=folder_ids, is_archived=False)
            
            # Create history rows
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

            # Update document fields
            docs_qs.update(
                is_archived=True,
                archived_at=now,
                archived_until=archived_until,
                archived_by=request.user,
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
        """
        Restore this folder, all subfolders, and all documents inside.
        """
        folder = get_object_or_404(Folder.objects.all(), pk=pk)
        now = timezone.now()
        folder_ids = self._descendant_folder_ids(folder)

        with transaction.atomic():
            # Update folders
            Folder.objects.filter(id__in=folder_ids).update(
                is_archived=False,
                archived_at=None,
                archived_until=None,
                archived_by=None,
            )

            # Find archived docs in these folders
            docs_qs = Document.objects.filter(parent_folder_id__in=folder_ids, is_archived=True)
            doc_ids = list(docs_qs.values_list("id", flat=True))

            # Update docs
            docs_qs.update(
                is_archived=False,
                archived_at=None,
                archived_until=None,
                archived_by=None,
            )

            # Mark active archive rows as restored
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
    """
    ViewSet for Document actions (archive, restore, list archived).
    Note: Standard CRUD is handled by APIViews below, but this is used for router actions.
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # By default hide archived
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
            document.save(update_fields=["is_archived", "archived_at", "archived_until", "archived_by"])

            # Expire old records
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
            document.save(update_fields=["is_archived", "archived_until"])

            # Update archive record
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
        qs = (
            DocumentArchive.objects.select_related("document", "archived_by")
            .filter(status=DocumentArchive.STATUS_ACTIVE)
            .order_by("-archived_at")
        )
        return Response(DocumentArchiveSerializer(qs, many=True).data, status=status.HTTP_200_OK)


class DocumentArchiveViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Optional: dedicated viewset for archive history if needed.
    """
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

        # If client sends a custom path, use it; otherwise prefer folder path.
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

        # Prevent upload into archived folder tree
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

        # Prefer folder path when no custom path
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

        document.doc_path.save(upload_path, file, save=False)
        document.save()

        # Create a SAFE COPY for V1 in history (so overwrites don't break V1)
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
    # Allows PUT with FormData + file
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
        """
        Supports:
        - AUDITABLE: metadata-only update -> chains to previous Safe History File
        - MINOR: file update -> creates new Safe History File & overwrites Live File
        - SILENT: metadata-only update -> NO new version created

        Also supports archiving fields via metadata update:
          - is_archived, archived_until, archive_note
        When a document is archived/restored, a DocumentArchive history row is created/updated.
        """
        document = get_object_or_404(Document, pk=pk)
        denied = _deny_if_archived_for_non_admin(request, document)
        if denied:
            return denied

        uploaded = request.FILES.get("file")
        update_type = (request.data.get("update_type") or "AUDITABLE").upper().strip()

        if update_type not in ("MINOR", "AUDITABLE", "SILENT"):
            update_type = "AUDITABLE"

        version_comment = request.data.get("version_comment") or ""

        with transaction.atomic():
            last_v = document.versions.order_by("-version_number").first()

            # Ensure initial v1 exists as a SAFE COPY
            if last_v is None and getattr(document.doc_path, "name", ""):
                try:
                    f_content = document.doc_path.read()
                except Exception:
                    f_content = b""

                v1 = DocumentVersion.objects.create(
                    document=document,
                    version_number=1,
                    change_type="AUDITABLE",
                    version_comment="Initial version",
                )
                current_name = os.path.basename(document.doc_path.name)
                v1_name = f"{document.id}/v1_{current_name}".replace("\\", "/")
                v1.version_path.save(v1_name, ContentFile(f_content))
                last_v = v1

            next_version = (last_v.version_number + 1) if last_v else 1

            if update_type != "SILENT":
                if update_type == "MINOR":
                    if not uploaded:
                        return Response(
                            {"error": "file is required for MINOR update"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    safe_name = os.path.basename(uploaded.name)

                    # 1) Save Safe History Copy
                    v = DocumentVersion.objects.create(
                        document=document,
                        version_number=next_version,
                        change_type="MINOR",
                        version_comment=version_comment or "Minor changes",
                    )
                    version_name = f"{document.id}/v{next_version}_{safe_name}".replace("\\", "/")
                    v.version_path.save(version_name, uploaded, save=True)

                    # Rewind for second save
                    try:
                        uploaded.seek(0)
                    except Exception:
                        pass

                    # 2) Overwrite Live File (keep it in folder path)
                    fol_path = _normalize_path(getattr(document.parent_folder, "fol_path", "") or "")
                    current_key = f"{fol_path}/{safe_name}" if fol_path else safe_name
                    current_key = current_key.replace("\\", "/")

                    document.doc_path.save(current_key, uploaded, save=False)
                    document.doc_size = uploaded.size

                    ext = os.path.splitext(safe_name)[1].lstrip(".").lower()
                    if ext:
                        document.doc_format = ext
                        document.doc_type = ext.upper()

                else:
                    # AUDITABLE: Link to previous Safe History File
                    v = DocumentVersion.objects.create(
                        document=document,
                        version_number=next_version,
                        change_type="AUDITABLE",
                        version_comment=version_comment or "Auditable update",
                    )
                    if last_v and last_v.version_path:
                        v.version_path.name = last_v.version_path.name
                        v.save(update_fields=["version_path"])

            # Apply metadata updates
            data = request.data.copy()
            data.pop("file", None)
            data.pop("doc_path", None)  # never allow direct setting of storage key
            data.pop("update_type", None)
            data.pop("version_comment", None)

            serializer = DocumentSerializer(document, data=data, partial=True)
            if not serializer.is_valid():
                return Response(serializer.errors, status=400)
            serializer.save()

            UserActionLog.objects.create(
                user=document.doc_owner,
                action="update",
                content_type=ContentType.objects.get_for_model(document),
                object_id=document.id,
                extra_info={"updated_fields": list(request.data.keys()), "update_type": update_type},
            )

        return Response(serializer.data, status=200)

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

        # ✅ hide archived
        documents = Document.objects.filter(doc_path__startswith=prefix, is_archived=False)
        serializer = DocumentSerializer(documents, many=True)
        return Response({"folder": folder, "documents": serializer.data}, status=status.HTTP_200_OK)


class DocumentByFolderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, folder_id):
        folder = get_object_or_404(Folder, id=folder_id)

        # ✅ hide archived
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