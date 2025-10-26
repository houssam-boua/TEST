from documents.views import DocumentViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentListCreateView, DocumentDetailView, create_folder, MinioFileListView, DocumentVersionViewSet

router = DefaultRouter()
router.register(r'document-versions', DocumentVersionViewSet, basename='documentversion')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    # Custom path for creating folders
    path('create-folder/', create_folder, name='create-folder'),
 
    # Explicit Document list and detail endpoints (for custom actions)
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    path('minio-files/', MinioFileListView.as_view(), name='minio-file-list'),
    path('', include(router.urls)),
]
