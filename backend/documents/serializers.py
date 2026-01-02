# serializers.py
from django.utils import timezone
from rest_framework import serializers

from users.models import User
from .models import (
    Document,
    DocumentCategory,
    DocumentNature,
    DocumentVersion,
    DocumentArchive,
    Folder,
)


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


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
    Main Document serializer (current/latest file + metadata).
    Includes versions read-only for history.
    """

    # Keep key only (so folder browsing doc_path__startswith keeps working)
    doc_path = serializers.FileField(read_only=True, use_url=False)

    # Full presigned URL for frontend "open/download"
    download_url = serializers.SerializerMethodField()

    # Nested versions (history)
    versions = serializers.SerializerMethodField(read_only=True)

    # Path index
    path_index = serializers.SerializerMethodField(read_only=True)

    # Optional: show who archived it (useful for admin)
    archived_by = UserMiniSerializer(read_only=True)

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

    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ("doc_path",)


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
    Shows:
    - document info
    - restoration date
    - remaining time
    - versions history (so admin can inspect before restore)
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
            # ✅ folder archiving fields (added in your updated model)
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
