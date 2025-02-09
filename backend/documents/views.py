from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        "doc_title",
        "doc_type",
        "doc_category",
        "doc_status",
        "doc_owner",
        "doc_departement",
        "doc_creation_date",
        "doc_modification_date",
        "doc_format",
        "doc_size",
        "doc_description",
        "doc_comment",
    ]
    #  GET /documents/?doc_title=John
