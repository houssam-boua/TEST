# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Document
from users.models import Departement
from .serializers import DocumentSerializer
import os

class DocumentListCreateView(APIView):
    def post(self, request):
        # Extract file and custom path
        file = request.FILES.get('file')
        path = request.data.get('doc_path')  # e.g., "projects/Alpha"

        # Validate required fields
        required_fields = [
            "doc_title", "doc_type", "doc_category", "doc_status", "doc_path",
            "doc_owner", "doc_departement", "doc_description"
        ]
        for field in required_fields:
            if not request.data.get(field):
                return Response({'error': f'Missing field: {field}'}, status=400)
        if not file or not path:
            return Response({'error': 'Missing file or path'}, status=400)

        # Create custom folder
        full_dir = os.path.join(settings.MEDIA_ROOT, path)

        if not os.path.exists(full_dir):
            try:
                os.makedirs(full_dir)
            except OSError as e:
                return Response({'error': f'Could not create directory: {str(e)}'}, status=500)

        # Save file manually
        file_path = os.path.join(full_dir, file.name)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # Create Document object
        owner_id = request.data.get('doc_owner')
        try:
            owner = get_user_model().objects.get(id=owner_id)
        except get_user_model().DoesNotExist:
            return Response({'error': 'Invalid owner ID'}, status=400)

        departement_id = request.data.get('doc_departement')
        try:
            departement = Departement.objects.get(id=departement_id)
        except Departement.DoesNotExist:
            return Response({'error': 'Invalid departement ID'}, status=400)

        doc_size = file.size
        doc_format = os.path.splitext(file.name)[1].lstrip('.')  # e.g., 'pdf'

        document = Document.objects.create(
            doc_title=request.data['doc_title'],
            doc_type=request.data['doc_type'],
            doc_category=request.data['doc_category'],
            doc_status=request.data['doc_status'],
            doc_path=file_path,
            doc_owner=owner,
            doc_departement=departement,
            doc_format=doc_format,
            doc_size=doc_size,
            doc_description=request.data['doc_description'],
            doc_comment=request.data['doc_comment'],
        )

        return Response({
            'status': 'uploaded',
            'document_id': document.id,
            'file_path': f'{path}/{file.name}'
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
            return Response({'status': 'updated'})
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        document.delete()
        return Response({'status': 'deleted'}, status=204)


@csrf_exempt
def create_folder(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        folder_path = data.get('path')  # e.g. "projects/NewProject/files"

        full_path = os.path.join(settings.MEDIA_ROOT, folder_path)
        os.makedirs(full_path, exist_ok=True)
        return JsonResponse({'status': 'created', 'path': folder_path})
