from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    '''Document serializer for serializing document data'''
    class Meta:
        model = Document
        fields = "__all__"
