from django.utils import timezone
from rest_framework import serializers

# ✅ Updated import to include Departement and Site
from users.models import User, Departement
from users.serializers import SiteSerializer # Import existing Site serializer if available or redefine here

from .models import (
    Document,
    DocumentCategory,
    DocumentNature,
    DocumentVersion,
    DocumentArchive,
    Folder,
    Site,
    DocumentType,
)


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


# ✅ NEW: Department Mini Serializer for display purposes
class DepartementMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = ["id", "dep_name", "dep_color"]


# ✅ NEW: DocumentType Serializer
class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"


class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = "__all__"


class DocumentNatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentNature
        fields = "__all__"


class DocumentVersionSerializer(serializers.ModelSerializer):
    """
    Serializer for DocumentVersion model (Historique rows).
    - version_path: returns storage key (relative path)
    - download_url: returns full URL (presigned) if storage backend supports it
    """
    version_path = serializers.FileField(read_only=True, use_url=False)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = DocumentVersion
        fields = "__all__"

    def get_download_url(self, obj):
        try:
            return obj.version_path.url if obj.version_path else None
        except Exception:
            return None


class DocumentSerializer(serializers.ModelSerializer):
    """
    Main Document serializer (READ operations).
    """

    # Keep key only (so folder browsing doc_path__startswith keeps working)
    doc_path = serializers.FileField(read_only=True, use_url=False)

    # Full presigned URL for frontend "open/download"
    download_url = serializers.SerializerMethodField()

    # Nested versions (history)
    versions = serializers.SerializerMethodField(read_only=True)

    # ✅ NEW: Latest version number helper
    latest_version = serializers.SerializerMethodField()

    # Path index
    path_index = serializers.SerializerMethodField(read_only=True)

    # Explicitly nest the owner details so frontend gets { username: "..." }
    doc_owner = UserMiniSerializer(read_only=True)
    
    # Optional: show who archived it
    archived_by = UserMiniSerializer(read_only=True)

    # ✅ NEW: Nested details for Site and Type (Read-Only)
    site_details = SiteSerializer(source='site', read_only=True)
    document_type_details = DocumentTypeSerializer(source='document_type', read_only=True)

    # ✅ NEW: Explicitly nest department details so frontend can display name
    doc_departement_details = DepartementMiniSerializer(source='doc_departement', read_only=True)

    def get_path_index(self, obj):
        return obj.get_path_index()

    def get_download_url(self, obj):
        try:
            return obj.doc_path.url if obj.doc_path else None
        except Exception:
            return None

    def get_versions(self, obj):
        qs = obj.versions.order_by("-version_number", "-version_date")
        return DocumentVersionSerializer(qs, many=True).data

    def get_latest_version(self, obj):
        # Efficiently get the highest version number
        last_v = obj.versions.order_by("-version_number").first()
        return last_v.version_number if last_v else 1

    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ("doc_path", "doc_owner", "doc_code", "document_type_order")


class DocumentCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for CREATE and UPDATE operations.
    Allows writable fields that are read-only in the main serializer.
    """
    doc_path = serializers.FileField(required=False) # Optional on update
    
    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ("doc_owner", "doc_code", "document_type_order")

    def validate_doc_code(self, value):
        # Only validate if doc_code provided (PUT/PATCH may omit it)
        if value is None:
            return value

        if not value or value.strip() == "":
            raise serializers.ValidationError("doc_code cannot be empty.")

        qs = Document.objects.filter(doc_code=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError("doc_code must be unique.")

        return value


class DocumentMiniSerializer(serializers.ModelSerializer):
    """
    Minimal Document serializer for nested representations.
    """
    doc_path = serializers.FileField(read_only=True, use_url=False)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "doc_title",
            "doc_code",
            "doc_path",
            "download_url",
            "is_archived",
            "archived_at",
            "archived_until",
        ]

    def get_download_url(self, obj):
        try:
            return obj.doc_path.url if obj.doc_path else None
        except Exception:
            return None


class DocumentArchiveSerializer(serializers.ModelSerializer):
    """
    Used for the admin Archivage page.
    """
    document = DocumentMiniSerializer(read_only=True)
    archived_by = UserMiniSerializer(read_only=True)

    restoration_date = serializers.SerializerMethodField()
    time_remaining_seconds = serializers.SerializerMethodField()
    versions = serializers.SerializerMethodField()

    class Meta:
        model = DocumentArchive
        fields = "__all__"

    def get_restoration_date(self, obj):
        return obj.retention_until

    def get_time_remaining_seconds(self, obj):
        if not obj.retention_until:
            return None  # permanent archive
        delta = obj.retention_until - timezone.now()
        return max(0, int(delta.total_seconds()))

    def get_versions(self, obj):
        if not obj.document_id:
            return []
        qs = obj.document.versions.order_by("-version_number", "-version_date")
        return DocumentVersionSerializer(qs, many=True).data


class FolderMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = [
            "id",
            "fol_name",
            "fol_path",
            "fol_index",
            "is_archived",
            "archived_at",
            "archived_until",
        ]


class FolderSerializer(serializers.ModelSerializer):
    parent_folder = serializers.PrimaryKeyRelatedField(
        queryset=Folder.objects.all(),
        required=False,
        allow_null=True,
    )
    fol_path = serializers.CharField(required=False, allow_blank=True)

    created_by = UserMiniSerializer(read_only=True)
    children = serializers.SerializerMethodField(read_only=True)

    # Optional: who archived the folder
    archived_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = Folder
        fields = [
            "id",
            "fol_name",
            "fol_path",
            "fol_index",
            "fol_order",
            "parent_folder",
            "created_by",
            "created_at",
            "updated_at",
            "children",
            "is_archived",
            "archived_at",
            "archived_until",
            "archived_by",
            "archived_note",
        ]
        read_only_fields = (
            "created_by",
            "created_at",
            "updated_at",
            "children",
            "archived_by",
            "archived_at",
        )

    def get_children(self, obj):
        children = obj.subfolders.all()
        return FolderMiniSerializer(children, many=True).data

    def validate(self, data):
        parent = data.get("parent_folder") or getattr(self.instance, "parent_folder", None)
        fol_name = data.get("fol_name")

        if fol_name:
            qs = Folder.objects.filter(fol_name=fol_name, parent_folder=parent)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"fol_name": "A folder with this name already exists in the selected parent."}
                )

        if self.instance:
            if parent and (parent == self.instance or self._is_descendant(parent, self.instance)):
                raise serializers.ValidationError("Circular parent-child relationship detected.")

        return data

    def _is_descendant(self, parent, instance):
        while parent:
            if parent == instance:
                return True
            parent = parent.parent_folder
        return False