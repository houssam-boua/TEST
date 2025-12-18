from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentViewSet,
    DocumentCategoryViewSet,
    DocumentNatureViewSet,
)

router = DefaultRouter()
router.register(r'document-categories', DocumentCategoryViewSet, basename='documentcategory')
router.register(r'document-natures', DocumentNatureViewSet, basename='documentnature')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]
