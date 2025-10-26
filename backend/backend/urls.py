"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from users.views import LoginView, LogoutView

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny, IsAuthenticated

schema_view = get_schema_view(
    openapi.Info(
        title="Docarea API",
        default_version="v1",
        description="API documentation for Docarea project",
    ),
    public=True,
    permission_classes=[],
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),

    # User management - users app
    path("api/", include("users.urls")),
    # Document management - documents app
    path("api/", include("documents.urls")),
    # Dashboard endpoints - dashboard app
    path("api/", include("dashboard.urls")),
    # Workflow management - workflows app
    path("api/", include("workflows.urls")),

    # Swagger
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc-ui'),
]

