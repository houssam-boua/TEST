from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RoleViewSet, DepartementViewSet

router = DefaultRouter()

router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'departements', DepartementViewSet, basename='departement')

urlpatterns = [
    path('', include(router.urls)),
]
