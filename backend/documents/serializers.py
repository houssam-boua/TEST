from rest_framework import serializers
from .models import Document, DocumentVersion


class DocumentSerializer(serializers.ModelSerializer):
    '''Document serializer for serializing document data'''
    doc_path = serializers.SerializerMethodField(read_only=True)

    def get_doc_path(self, obj):
        # Return only the relative file path, not the full URL
        return str(obj.doc_path)

    class Meta:
        model = Document
        fields = "__all__"

class DocumentVersionSerializer(serializers.ModelSerializer):
    '''Serializer for DocumentVersion model'''
    class Meta:
        model = DocumentVersion
        fields = "__all__"
