from documents.views import DocumentViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentListCreateView,
    DocumentDetailView,
    create_folder,
    MinioFileListView,
    FolderDocumentsView,
    DocumentVersionViewSet,
    onlyoffice_config,
    onlyoffice_callback,
)

router = DefaultRouter()
router.register(r'document-versions', DocumentVersionViewSet, basename='documentversion')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    # Custom path for creating folders
    path('documents/create-folder/', create_folder, name='create-folder'),
 
    # Explicit Document list and detail endpoints (for custom actions)
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/folders/', MinioFileListView.as_view(), name='minio-file-list'),

    # List documents inside a specific folder (provide ?folder=path/to/folder)
    path('documents/by-folder/', FolderDocumentsView.as_view(), name='documents-by-folder'),

    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/onlyoffice-config/', onlyoffice_config, name='onlyoffice-config'),
    path('documents/<int:pk>/onlyoffice-callback/', onlyoffice_callback, name='onlyoffice-callback'),
    path('', include(router.urls)),
]
