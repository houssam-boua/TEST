from rest_framework import serializers
from .models import (
    Document, DocumentCategory, DocumentNature, DocumentVersion, Folder
)
from users.models import User

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = "__all__"

class DocumentNatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentNature
        fields = "__all__"

# Removed DocumentVersionSerializer, DocumentDistributionSerializer, and DocumentArchiveSerializer as part of ISMS simplification.

class DocumentSerializer(serializers.ModelSerializer):
    doc_path = serializers.SerializerMethodField(read_only=True)
    doc_category = DocumentCategorySerializer(read_only=True)
    doc_nature = DocumentNatureSerializer(read_only=True)
    parent_document = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Document
        fields = "__all__"

class DocumentMiniSerializer(serializers.ModelSerializer):
    '''Minimal Document serializer for nested representations'''
    doc_path = serializers.SerializerMethodField(read_only=True)

    def get_doc_path(self, obj):
        # Return only the relative file path, not the full URL
        return str(obj.doc_path)
    
    class Meta:
        model = Document
        fields = ['id', 'doc_title', 'doc_path']

class DocumentVersionSerializer(serializers.ModelSerializer):
    '''Serializer for DocumentVersion model'''
    class Meta:
        model = DocumentVersion
        fields = "__all__"

class FolderMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'fol_name', 'fol_path', 'fol_index']

class FolderSerializer(serializers.ModelSerializer):
    parent_folder = serializers.PrimaryKeyRelatedField(
        queryset=Folder.objects.all(), required=False, allow_null=True
    )
    fol_path = serializers.CharField(required=False, allow_blank=True)
    created_by = UserMiniSerializer(read_only=True)
    children = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Folder
        fields = [
            'id', 'fol_name', 'fol_path', 'fol_index',
            'parent_folder',
            'created_by', 'created_at', 'updated_at', 'children'
        ]
        read_only_fields = ('created_by', 'created_at', 'updated_at', 'children')

    def get_children(self, obj):
        children = obj.subfolders.all()
        return FolderMiniSerializer(children, many=True).data

    def validate(self, data):
        parent = data.get('parent_folder') or getattr(self.instance, 'parent_folder', None)
        if self.instance:
            # Editing: prevent setting self or descendant as parent
            if parent and (parent == self.instance or self._is_descendant(parent, self.instance)):
                raise serializers.ValidationError('Circular parent-child relationship detected.')
        else:
            # Creating: prevent setting self as parent (shouldn't happen, but for safety)
            if parent and self.instance and parent == self.instance:
                raise serializers.ValidationError('Folder cannot be its own parent.')
        return data

    def _is_descendant(self, parent, instance):
        # Check if parent is a descendant of instance
        while parent:
            if parent == instance:
                return True
            parent = parent.parent_folder
        return False
