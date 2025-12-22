from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentViewSet,
    DocumentListCreateView,
    DocumentDetailView,
    DocumentCategoryViewSet,
    DocumentNatureViewSet,
    FolderViewSet,
)

router = DefaultRouter()
router.register(r'document-categories', DocumentCategoryViewSet, basename='documentcategory')
router.register(r'document-natures', DocumentNatureViewSet, basename='documentnature')
# router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'folders', FolderViewSet, basename='folders')

urlpatterns = [
    path('documents/', DocumentListCreateView.as_view()),
    path('documents/<int:pk>/', DocumentDetailView.as_view()),
    path('', include(router.urls)),
]
