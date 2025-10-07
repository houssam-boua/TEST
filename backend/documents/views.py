# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from .models import Document, DocumentVersion
from users.models import Departement
from .serializers import DocumentSerializer, DocumentVersionSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

class DocumentListCreateView(APIView):
    def post(self, request):
        # Extract file and custom path
        file = request.FILES.get('file')
        custom_path = request.data.get('doc_path', '')  # Folder prefix (e.g., "projects/2024")
 
        # Validate required fields
        required_fields = [
            "file", "doc_category", "doc_status", "doc_owner", 
            "doc_departement", "doc_description"
        ]
        for field in required_fields:
            value = request.FILES.get(field) if field == "file" else request.data.get(field)
            if not value:
                return Response({'error': f'Missing field: {field}'}, status=400)
 
        if not file:
            return Response({'error': 'Missing file'}, status=400)
 
        # Get owner
        owner_id = request.data.get('doc_owner')
        try:
            owner = get_user_model().objects.get(id=owner_id)
        except get_user_model().DoesNotExist:
            return Response({'error': 'Invalid owner ID'}, status=400)
 
        # Get department
        departement_id = request.data.get('doc_departement')
        try:
            departement = Departement.objects.get(id=departement_id)
        except Departement.DoesNotExist:
            return Response({'error': 'Invalid departement ID'}, status=400)
 
        # Extract file metadata
        doc_size = file.size
        doc_format = file.name.split('.')[-1] if '.' in file.name else ''
        doc_title = file.name
 
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
            doc_type=doc_format,
            doc_category=request.data['doc_category'],
            doc_status=request.data['doc_status'],
            doc_owner=owner,
            doc_departement=departement,
            doc_format=doc_format,
            doc_size=doc_size,
            doc_description=request.data['doc_description'],
            doc_comment=request.data.get('doc_comment', ''),
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
            return Response({'status': 'Document updated successfully'})
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        document.delete()  # This will also delete the file from MinIO (see model's delete method)
        return Response({'status': 'Document deleted successfully'}, status=200)


@csrf_exempt
def create_folder(request):
    """
    Create a logical folder in MinIO by adding a .keep placeholder file.
    In S3/MinIO, folders don't exist; they're just prefixes in object keys.
    """
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        folder_path = data.get('path')  # e.g., "projects/NewProject/files"
        
        if not folder_path:
            return Response({'error': 'Missing folder path'}, status=400)

        # Normalize the path
        folder_path = folder_path.strip('/').replace('\\', '/')
        
        # Create a placeholder file to establish the folder prefix
        placeholder_path = f"documents/{folder_path}/.keep"
        
        try:
            default_storage.save(placeholder_path, ContentFile(b""))
            return Response({
                'status': 'Folder created successfully',
                'path': folder_path
            }, status=201)
        except Exception as e:
            return Response({
                'error': f'Failed to create folder: {str(e)}'
            }, status=500)
    
class MinioFileListView(APIView):
    """
    API endpoint that lists all files stored in MinIO using Django's default storage backend.
    """
    def get(self, request):
        # List all files and directories at the root of the storage
        directories, files = default_storage.listdir("")
        # Combine files and directories for a flat listing, or return separately
        return Response({
            "directories": directories,
            "files": files
        }, status=status.HTTP_200_OK)

class DocumentVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for DocumentVersion model.
    """
    queryset = DocumentVersion.objects.all()
    serializer_class = DocumentVersionSerializer

