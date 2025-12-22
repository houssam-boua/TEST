# views.py
from .models import Folder
from .serializers import FolderSerializer
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, serializers
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging
import json
from .models import Document, DocumentVersion
from users.models import Departement
from .serializers import DocumentSerializer, DocumentVersionSerializer
from users.models import UserActionLog
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes
import requests
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
import jwt
import datetime
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import (
    Document, DocumentCategory, DocumentNature
)
from .serializers import (
    DocumentSerializer, DocumentCategorySerializer, DocumentNatureSerializer
)
from .utils import generate_document_code, validate_document_code
from django.utils import timezone
from django.db import transaction
from users.models import User

class DocumentCategoryViewSet(viewsets.ModelViewSet):
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer

class DocumentNatureViewSet(viewsets.ModelViewSet):
    queryset = DocumentNature.objects.all()
    serializer_class = DocumentNatureSerializer

# Removed DocumentVersionViewSet, DocumentDistributionViewSet, and DocumentArchiveViewSet as part of ISMS simplification.

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

class DocumentListCreateView(APIView):
    def post(self, request):
        # Extract file and custom path
        file = request.FILES.get('file')
        departement_id = request.data.get('doc_departement')
        custom_path = request.data.get('doc_path', '')  # Folder prefix (e.g., "projects/2024")
        print(f"DIAGNOSTIC: Received custom_path = '{custom_path}'")

        format_and_types = {
            'pdf': 'PDF',
            'docx': 'Word Document',
            'xlsx': 'Excel Spreadsheet',
            'csv': 'CSV File',
            'txt': 'Text File',
            'png': 'PNG Image',
            'jpg': 'JPEG Image',
            'jpeg': 'JPEG Image',
        }
        # Validate required fields. Only `file` is strictly required from the
        # client; other fields are optional or can be inferred server-side.
        if not file:
            return Response({'error': 'Missing field: file'}, status=400)
 
        if not file:
            return Response({'error': 'Missing file'}, status=400)
 
        # Get owner: prefer explicit doc_owner, otherwise fall back to
        # authenticated user if available.
        owner_id = request.data.get('doc_owner')
        owner = None
        if owner_id:
            try:
                owner = get_user_model().objects.get(id=owner_id)
            except get_user_model().DoesNotExist:
                return Response({'error': 'Invalid owner ID'}, status=400)
        else:
            if request.user and request.user.is_authenticated:
                owner = request.user
            else:
                return Response({'error': 'Missing field: doc_owner'}, status=400)
 
        # Get department
        departement_id = request.data.get('doc_departement')
        try:
            departement = Departement.objects.get(id=departement_id)
        except Departement.DoesNotExist:
            return Response({'error': 'Invalid departement ID'}, status=400)
    
        # Get Nature
        nature_id = request.data.get('doc_nature')
        try:
            nature = DocumentNature.objects.get(id=nature_id)
        except DocumentNature.DoesNotExist:
            return Response({'error': 'Invalid nature ID'}, status=400)

        # Find the last doc_nature_order for this nature (gaps are OK)
        last_order = Document.objects.filter(doc_nature=nature).order_by('-doc_nature_order').first()
        next_order = (last_order.doc_nature_order + 1) if last_order and last_order.doc_nature_order is not None else 1
        print(f"DIAGNOSTIC: Using next order = '{next_order}'")
        
        # Extract file metadata
        doc_size = file.size
        print("DOC SIZE", doc_size)   
        doc_format = file.name.split('.')[-1] if '.' in file.name else ''
        doc_title = request.data.get('doc_title', '')
        # Use sensible defaults for optional fields
        doc_status_type = request.data.get('doc_status', 'draft')
        doc_description_val = request.data.get('doc_description', '')
        # Generate doc_code as <nature_code><order>, e.g., IT1, ET2, etc.
        doc_code = f"{nature.code}-{next_order}"
        # Build the upload path: custom_path + filename
        # Normalize slashes and ensure no leading/trailing slashes cause issues
        if custom_path:
            custom_path = custom_path.strip('/').replace('\\', '/')
            upload_path = f"{custom_path}/{file.name}"
        else:
            upload_path = file.name
        
        # Ensure the path uses forward slashes for consistency
        upload_path = upload_path.replace('\\', '/')
 
        # Create Document instance
        document = Document(
            doc_title=doc_title,
            doc_type=format_and_types.get(doc_format.lower(), 'Unknown'),
            doc_status_type=doc_status_type,
            doc_owner=owner,
            doc_departement=departement,
            doc_format=doc_format,
            doc_code=doc_code,
            doc_size=doc_size,
            doc_description=doc_description_val,
            doc_nature=nature,
            doc_nature_order=next_order,
        )
 
        # DIAGNOSTIC: Print storage backend type
        print(f"DIAGNOSTIC: Storage backend = {type(document.doc_path.storage)}")
        print(f"DIAGNOSTIC: Storage backend class = {document.doc_path.storage.__class__.__name__}")
        print(f"DIAGNOSTIC: Upload path = {upload_path}")
 
        # Save file to storage (MinIO/S3)
        # The save() method handles both storage and file writing
        document.doc_path.save(upload_path, file, save=False)
        
        # Now save the document to database
        document.save()
        # Log create action
        UserActionLog.objects.create(
            user=owner,
            action="create",
            content_type=ContentType.objects.get_for_model(document),
            object_id=document.id,
            extra_info={"doc_title": doc_title}
        )
 
        serializer = DocumentSerializer(document)
        return Response({
            'message': 'Document uploaded successfully',
            'document': serializer.data
        }, status=201)

    def get(self, request):
        documents = Document.objects.all()
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

class DocumentDetailView(APIView):
    def get(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        serializer = DocumentSerializer(document)
        return Response(serializer.data)

    def put(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        serializer = DocumentSerializer(document, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Log update action
            UserActionLog.objects.create(
                user=document.doc_owner,
                action="update",
                content_type=ContentType.objects.get_for_model(document),
                object_id=document.id,
                extra_info={"updated_fields": list(request.data.keys())}
            )
            return Response({'status': 'Document updated successfully'})
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        owner = document.doc_owner
        doc_id = document.id
        document.delete()  # This will also delete the file from MinIO (see model's delete method)
        # Log delete action
        UserActionLog.objects.create(
            user=owner,
            action="delete",
            content_type=ContentType.objects.get_for_model(Document),
            object_id=doc_id,
            extra_info={"doc_title": getattr(document, "doc_title", None)}
        )
        return Response({'status': 'Document deleted successfully'}, status=200)

class DocumentVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for DocumentVersion model.
    """
    queryset = DocumentVersion.objects.all()
    serializer_class = DocumentVersionSerializer

class MinioFileListView(APIView):
    """
    API endpoint that lists all folder paths stored in MinIO using Django's default storage backend.
    """
    def get(self, request):
        def get_all_directories(path=""):
            directories, files = default_storage.listdir(path)
            all_dirs = []
            for dir_name in directories:
                full_path = f"{path}/{dir_name}".lstrip('/')
                all_dirs.append(full_path)
                # Recurse into subdirectory
                sub_dirs = get_all_directories(full_path)
                all_dirs.extend(sub_dirs)
            return all_dirs
        
        all_directories = get_all_directories()
        return Response({
            "folders": all_directories
        }, status=status.HTTP_200_OK)
    
class FolderDocumentsView(APIView):
    """
    API endpoint to list documents under a specific folder (including nested subfolders).
    Provide the folder path as a query parameter: ?folder=path/to/folder

    Example:
      GET /api/documents/by-folder/?folder=projects/2024/reports
    """
    def get(self, request):
        folder = request.query_params.get('folder', '').strip()
        if not folder:
            return Response(
                {'error': 'Missing folder query parameter. Use ?folder=path/to/folder'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize path: remove leading/trailing slashes and convert backslashes
        folder = folder.strip('/').replace('\\', '/')
        prefix = f"{folder}/" if not folder.endswith('/') else folder

        # Query documents whose stored path starts with the folder prefix
        documents = Document.objects.filter(doc_path__startswith=prefix)
        serializer = DocumentSerializer(documents, many=True)
        return Response({
            'folder': folder,
            'documents': serializer.data
        }, status=status.HTTP_200_OK)
    
class CreateFolderSerializer(serializers.Serializer):
    path = serializers.CharField(help_text="Folder path to create, e.g. 'projects/NewProject/files'")

@swagger_auto_schema(
    method='post',
    request_body=CreateFolderSerializer,
    responses={
        201: openapi.Response('Folder created successfully'),
        400: openapi.Response('Bad request'),
        500: openapi.Response('Server error'),
    }
)

@api_view(['POST'])
# def create_folder(request):
#     """
#     Create a logical folder in MinIO by adding a .keep placeholder file.
#     In S3/MinIO, folders don't exist; they're just prefixes in object keys.
#     """
#     serializer = CreateFolderSerializer(data=request.data)
#     if not serializer.is_valid():
#         return Response(serializer.errors, status=400)

#     folder_path = serializer.validated_data.get('path')
#     if not folder_path:
#         return Response({'error': 'Missing folder path'}, status=400)

#     # Normalize the path
#     folder_path = folder_path.strip('/').replace('\\', '/')

#     # Create a placeholder file to establish the folder prefix
#     # placeholder_path = f"documents/{folder_path}/.keep"
#     placeholder_path = f"{folder_path}/.keep" if folder_path else ".keep"

#     try:
#         default_storage.save(placeholder_path, ContentFile(b""))
#         return Response({
#             'status': 'Folder created successfully',
#             'path': folder_path
#         }, status=201)
#     except Exception as e:
#         return Response({
#             'error': f'Failed to create folder: {str(e)}'
#         }, status=500)
  

# OnlyOffice integration endpoints
@api_view(["GET"])
def onlyoffice_config(request, pk):
    """Return OnlyOffice editor configuration for the given document id."""
    document = get_object_or_404(Document, pk=pk)

    # Build a URL that Document Server can reach. Use storage.url() so backends
    # that return presigned urls (e.g. S3/MinIO configured) will work.
    try:
        file_path = getattr(document.doc_path, "name", str(document.doc_path))
    except Exception:
        file_path = str(document.doc_path)

    try:
        file_url = default_storage.url(file_path)
    except Exception:
        # Fallback to building a simple URL assuming MinIO on localhost
        file_url = request.build_absolute_uri(f"/media/{file_path}")
    

    # Unique key which should change when the file changes (used by OnlyOffice caching)
    doc_key = f"{document.id}-{int(document.updated_at.timestamp())}"

    # Allow overriding the callback host for Docker-based Document Server
    # Example: set ONLYOFFICE_CALLBACK_HOST=host.docker.internal:8000
    callback_host = os.getenv("ONLYOFFICE_CALLBACK_HOST")
    if callback_host:
        # If host contains scheme, use it directly; otherwise assume http
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

    # If an ONLYOFFICE JWT secret is configured, sign the config as a token
    # so Document Server (if configured to require JWT) can verify requests.
    # The token payload is wrapped under the 'payload' key per OnlyOffice connector conventions.
    secret = getattr(settings, "ONLYOFFICE_JWT_SECRET", None) or os.getenv("ONLYOFFICE_JWT_SECRET") or os.getenv("ONLYOFFICE_SECRET")
    if secret:
        try:
            # Token expires shortly to reduce replay window
            exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
            # Many OnlyOffice setups expect the signed JWT to contain the
            # `document` and `editorConfig` keys at the top level (not wrapped
            # under a `payload` key). Sign those explicitly so the Document
            # Server can validate the token structure.
            token_payload = {
                "document": config.get("document"),
                "editorConfig": config.get("editorConfig"),
                "exp": exp,
            }
            token = jwt.encode(token_payload, secret, algorithm="HS256")
            # Include token at top level and also inside document for compatibility
            config["token"] = token
            config["document"]["token"] = token
        except Exception as exc:
            # Don't fail the whole request if signing fails; log and continue without token
            print(f"ONLYOFFICE: token signing failed: {exc}")

    return Response(config)

@api_view(["GET"])
def onlyoffice_script_proxy(request):
    """Fetch the OnlyOffice client script from the Document Server and return it
    with permissive CORS headers to avoid browser blocking in development.
    """
    # Source Document Server base URL (allow override via env)
    docserver = os.getenv("ONLYOFFICE_URL") or os.getenv("VITE_ONLYOFFICE_URL") or "http://localhost:8080"
    script_url = f"{docserver.rstrip('/')}/web-apps/apps/api/documents/api.js"
    try:
        r = requests.get(script_url, timeout=10)
    except Exception as exc:
        return Response({"error": f"Failed to fetch script from Document Server: {exc}"}, status=502)

    if r.status_code != 200:
        return Response({"error": f"Document Server returned {r.status_code}"}, status=502)

    resp = HttpResponse(r.content, content_type="application/javascript")
    # Permissive CORS for local development; in production narrow this to your frontend origin.
    resp["Access-Control-Allow-Origin"] = "*"
    resp["Cache-Control"] = "public, max-age=3600"
    return resp


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def onlyoffice_callback(request, pk):
    """Handle OnlyOffice save callbacks. Downloads updated file when supplied and replaces stored file.

    This handler now logs incoming payloads and download probe results to the Django logger.
    Optionally set the env var `ONLYOFFICE_CALLBACK_LOG_FILE` to append JSON debug lines to a file.
    """
    logger = logging.getLogger(__name__)

    # Raw body for diagnostics
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

    # Log to console/standard logger for easy viewing
    try:
        logger.info("ONLYOFFICE CALLBACK: %s", json.dumps(log_entry))
    except Exception:
        logger.exception("Failed to log onlyoffice callback payload")

    # Optionally persist to a file for easier post-mortem
    log_file = os.getenv("ONLYOFFICE_CALLBACK_LOG_FILE")
    if log_file:
        try:
            with open(log_file, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(log_entry) + "\n")
        except Exception:
            logger.exception("Failed to write onlyoffice callback log file")

    status_code = data.get("status")

    # status 2 = document is ready to be saved (see OnlyOffice docs)
    if status_code in (2, 3, 4, "2", "3", "4"):
        download_url = data.get("url") or data.get("downloadUri")
        if download_url:
            # Probe the download URL with a HEAD request first (may fail faster)
            try:
                head = requests.head(download_url, allow_redirects=True, timeout=10)
                logger.info("OnlyOffice callback HEAD %s -> %s", download_url, head.status_code)
            except Exception:
                logger.exception("HEAD to download URL failed; will attempt GET")

            try:
                r = requests.get(download_url, stream=True, timeout=30)
                logger.info("OnlyOffice callback GET %s -> %s (len=%s)", download_url, r.status_code, r.headers.get("Content-Length"))
                if r.status_code == 200:
                    document = get_object_or_404(Document, pk=pk)
                    content = r.content
                    name = getattr(document.doc_path, "name", None) or f"documents/{document.doc_title}"
                    document.doc_path.save(name, ContentFile(content), save=True)
                    logger.info("OnlyOffice callback: saved document %s", pk)
                    return Response({"error": 0})
                else:
                    logger.error("OnlyOffice callback: download GET returned %s", r.status_code)
            except Exception as exc:
                logger.exception("OnlyOffice callback: error downloading file: %s", exc)
                return Response({"error": 1, "message": str(exc)})

        logger.error("OnlyOffice callback: no download url provided in payload")
        return Response({"error": 1, "message": "no download url"})

    return Response({"error": 0})

class FolderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing folders.

    Provides CRUD operations, search, ordering, and hierarchical views for Folder objects.
    
    - Requires authentication.
    - Supports filtering, searching, and ordering.
    - Includes custom actions for root folders and hierarchical tree.
    """
    queryset = Folder.objects.select_related('parent_folder', 'created_by').prefetch_related('subfolders').all()
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]
    from rest_framework import filters
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['fol_index', 'parent_folder']
    search_fields = ['fol_name', 'fol_path']
    ordering_fields = ['fol_name', 'fol_index', 'created_at', 'updated_at']
    ordering = ['fol_index', 'fol_name']

    def perform_create(self, serializer):
        """
        Set the created_by field to the current user on creation.
        Also create a logical folder in MinIO by adding a .keep placeholder file.
        The folder path will be parent_path + current folder name.
        If fol_index is 'PR', set fol_order to the next available order in the parent folder.
        """
        folder_data = serializer.validated_data
        fol_index = folder_data.get('fol_index')
        parent_folder = folder_data.get('parent_folder')
        folder = serializer.save(created_by=self.request.user)
        # Assign order if fol_index is 'PR'
        if fol_index == 'PR':
            from .models import Folder
            siblings = Folder.objects.filter(parent_folder=parent_folder, fol_index='PR').order_by('id')
            folder.fol_order = siblings.count()
            folder.save(update_fields=["fol_order"])
        from django.core.files.base import ContentFile
        from django.core.files.storage import default_storage
        # Build the full path: parent path + current folder name
        parent_path = ''
        if folder.parent_folder:
            parent_path = folder.parent_folder.fol_path.strip('/').replace('\\', '/')
        folder_name = folder.fol_name.strip('/').replace('\\', '/')
        full_path = f"{parent_path}/{folder_name}" if parent_path else folder_name
        # Update the folder's fol_path if needed
        if folder.fol_path != full_path:
            folder.fol_path = full_path
            folder.save(update_fields=["fol_path"])
        placeholder_path = f"{full_path}/.keep" if full_path else ".keep"
        try:
            default_storage.save(placeholder_path, ContentFile(b""))
        except Exception as e:
            # Optionally log or handle the error
            pass

    @action(detail=False, methods=['get'], url_path='roots')
    def roots(self, request):
        """
        Returns all root folders (folders with no parent).
        """
        roots = self.get_queryset().filter(parent_folder=None)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='tree')
    def tree(self, request):
        """
        Returns the hierarchical folder structure as a tree.
        """
        def build_tree(parent):
            children = parent.subfolders.all()
            return {
                'id': parent.id,
                'fol_name': parent.fol_name,
                'fol_path': parent.fol_path,
                'fol_index': parent.fol_index,
                'created_by': parent.created_by_id,
                'created_at': parent.created_at,
                'updated_at': parent.updated_at,
                'subfolders': [build_tree(child) for child in children]
            }
        roots = self.get_queryset().filter(parent_folder=None)
        tree = [build_tree(folder) for folder in roots]
        return Response(tree)
