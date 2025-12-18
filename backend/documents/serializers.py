from rest_framework import serializers
from .models import (
    Document, DocumentCategory, DocumentNature, DocumentVersion
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
