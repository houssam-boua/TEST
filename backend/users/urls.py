from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserViewActionLogSet, RoleViewSet, DepartementViewSet,  LoginView, LogoutView


router = DefaultRouter()

router.register(r"users", UserViewSet, basename="user")
router.register(r"useractionlogs", UserViewActionLogSet, basename="useractionlog")
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"departements", DepartementViewSet, basename="departement")

urlpatterns = [
    path("", include(router.urls)),
]
