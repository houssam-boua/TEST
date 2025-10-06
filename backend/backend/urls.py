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
        title="GED API",
        default_version="v1",
        description="API documentation for GED project",
    ),
    public=True,
    permission_classes=[],
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication

    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),

    # User, Role, Departements management (CRUD) - users app
    
        # - Get all users           : GET /users/
        # - Create a new user       : POST /users/
        # - Get a user by ID        : GET /users/1/
        # - Update a user by ID     : PUT /users/1/
        # - Delete a user by ID     : DELETE /users/1/
        # - Search by username      : GET /users/?username=exemple
        # - Search by email         : GET /users/?email=exemple@exemple.com
        # - Search by first_name    : GET /users/?first_name=exemple
        # - Search by last_name     : GET /users/?last_name=exemple

        # - Get all roles           : GET /roles/
        # - Create a new role       : POST /roles/
        # - Get a role by ID        : GET /roles/1/
        # - Update a role by ID     : PUT /roles/1/
        # - Delete a role by ID     : DELETE /roles/1/
        # - Search by role_name     : GET /roles/?role_name=exemple
        # - Search by role_type     : GET /roles/?role_type=exemple

        # - Get all departements    : GET /departements/
        # - Create a new departement: POST /departements/
        # - Get a departement by ID : GET /departements/1/
        # - Update a departement by ID: PUT /departements/1/
        # - Delete a departement by ID: DELETE /departements/1/
        # - Search by dep_name       : GET /departements/?dep_name=exemple
        # - Search by dep_type       : GET /departements/?dep_type=exemple

        path("api/", include("users.urls")),

    # Document management (CRUD) - documents app

        # - Get all documents           : GET /documents/
        # - Create a new document       : POST /documents/
        # - Get a document by ID        : GET /documents/1/
        # - Update a document by ID     : PUT /documents/1/
        # - Delete a document by ID     : DELETE /documents/1/
        # - Search by doc_title         : GET /documents/?doc_title=exemple
        # - Search by doc_type          : GET /documents/?doc_type=exemple
        # - Search by doc_category      : GET /documents/?doc_category=exemple
        # - Search by doc_status        : GET /documents/?doc_status=exemple
        # - Search by doc_owner         : GET /documents/?doc_owner=exemple
        # - Search by doc_departement   : GET /documents/?doc_departement=exemple
        # - Search by doc_creation_date : GET /documents/?doc_creation_date=exemple
        # - Search by doc_modification_date: GET /documents/?doc_modification_date=exemple
        # - Search by doc_format        : GET /documents/?doc_format=exemple
        # - Search by doc_size          : GET /documents/?doc_size=exemple

        path("api/", include("documents.urls")),

    # Workflow & Task management (CRUD) - workflows app

        # - Get all workflows           : GET /workflows/
        # - Create a new workflow       : POST /workflows/
        # - Get a workflow by ID        : GET /workflows/1/
        # - Update a workflow by ID     : PUT /workflows/1/
        # - Delete a workflow by ID     : DELETE /workflows/1/
        # - Search by workflow_name     : GET /workflows/?workflow_name=exemple
        # - Search by workflow_type     : GET /workflows/?workflow_type=exemple
        # - Search by workflow_status   : GET /workflows/?workflow_status=exemple
        # - Search by workflow_owner    : GET /workflows/?workflow_owner=exemple
        # - Search by workflow_departement: GET /workflows/?workflow_departement=exemple
        # - Search by workflow_creation_date: GET /workflows/?workflow_creation_date=exemple
        # - Search by workflow_modification_date: GET /workflows/?workflow_modification_date=exemple
    
        # - Get all tasks               : GET /tasks/
        # - Create a new task           : POST /tasks/
        # - Get a task by ID            : GET /tasks/1/
        # - Update a task by ID         : PUT /tasks/1/
        # - Delete a task by ID         : DELETE /tasks/1/
        # - Search by task_name         : GET /tasks/?task_name=exemple
        # - Search by task_type         : GET /tasks/?task_type=exemple
        # - Search by task_status       : GET /tasks/?task_status=exemple
        # - Search by task_owner        : GET /tasks/?task_owner=exemple
        # - Search by task_workflow     : GET /tasks/?task_workflow=exemple
        # - Search by task_creation_date: GET /tasks/?task_creation_date=exemple
        # - Search by task_modification_date: GET /tasks/?task_modification_date=exemple

        path("api/", include("workflows.urls")),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc-ui'),
]

