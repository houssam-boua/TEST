from django.urls import path, include
from .views import DocumentListCreateView, DocumentDetailView, create_folder

urlpatterns = [
    # Custom path for creating folders
    path('create-folder/', create_folder, name='create-folder'),

    # Explicit Document list and detail endpoints (for custom actions)
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
]
