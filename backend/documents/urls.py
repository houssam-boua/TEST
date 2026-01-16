# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    # APIViews
    DocumentCodeViewSet,
    DocumentListCreateView,
    DocumentDetailView,
    FolderDocumentsView,
    DocumentByFolderView,
    DocumentVersionsByDocumentView,
    ArchiveNavigationView,
    SyncFoldersView,  # ✅ NEW IMPORT

    # ViewSets
    DocumentViewSet,
    DocumentCategoryViewSet,
    DocumentNatureViewSet,
    FolderViewSet,
    DocumentVersionViewSet,
    
    # ✅ NEW VIEWSETS
    SiteViewSet,
    DocumentTypeViewSet,

    # OnlyOffice
    onlyoffice_config,
    onlyoffice_callback,
    onlyoffice_script_proxy,
)

router = DefaultRouter()
router.register(r"document-categories", DocumentCategoryViewSet, basename="documentcategory")
router.register(r"document-natures", DocumentNatureViewSet, basename="documentnature")
router.register(r"folders", FolderViewSet, basename="folders")

# ✅ NEW: Register Site and DocumentType ViewSets
router.register(r"sites", SiteViewSet, basename="sites")
router.register(r"document-types", DocumentTypeViewSet, basename="document-types")
router.register(r'document-codes', DocumentCodeViewSet, basename='document-code')
# Optional (handy for admin/debug):
router.register(r"document-versions", DocumentVersionViewSet, basename="documentversion")

# NOTE: We DO NOT register "documents" in the router here.
# We manually define the paths below to prevent URL pattern conflicts (404/500 errors).

urlpatterns = [
    # ------------------------------------------------------------------
    # ✅ 1. Archive Navigation (Smart Browser)
    # ------------------------------------------------------------------
    path(
        "archives/navigation/", 
        ArchiveNavigationView.as_view(), 
        name="archive-navigation"
    ),

    # ------------------------------------------------------------------
    # ✅ 2. Archive Actions (MUST come BEFORE generic documents/<int:pk>/)
    # ------------------------------------------------------------------
    path(
        "documents/archived/",
        DocumentViewSet.as_view({"get": "archived"}),
        name="document-archived-list"
    ),
    path(
        "documents/<int:pk>/archive/",
        DocumentViewSet.as_view({"post": "archive"}),
        name="document-archive"
    ),
    path(
        "documents/<int:pk>/restore/",
        DocumentViewSet.as_view({"post": "restore"}),
        name="document-restore"
    ),

    # ------------------------------------------------------------------
    # ✅ 3. Standard Document CRUD
    # ------------------------------------------------------------------
    path("documents/", DocumentListCreateView.as_view(), name="document-list-create"),
    path("documents/<int:pk>/", DocumentDetailView.as_view(), name="document-detail"),

    # ------------------------------------------------------------------
    # ✅ 4. Utilities & Helpers
    # ------------------------------------------------------------------
    # Versions (Historique)
    path("documents/<int:pk>/versions/", DocumentVersionsByDocumentView.as_view()),

    # Folder-related helpers
    path("documents/by-folder/", FolderDocumentsView.as_view()),  # ?folder=path/to/folder
    path("documents/by-folder/<int:folder_id>/", DocumentByFolderView.as_view()),
    
    # ✅ NEW: Sync Folders Endpoint (S3 Ghost Cleanup)
    path("folders/sync/", SyncFoldersView.as_view(), name="sync-folders"),

    # OnlyOffice
    path("documents/<int:pk>/onlyoffice-config/", onlyoffice_config),
    path("documents/<int:pk>/onlyoffice-callback/", onlyoffice_callback),
    path("onlyoffice/script/", onlyoffice_script_proxy),

    # ------------------------------------------------------------------
    # ✅ 5. Router URLs (Folders, Categories, Natures, Sites, Types)
    # ------------------------------------------------------------------
    path("", include(router.urls)),
]