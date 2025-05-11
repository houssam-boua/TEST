# Renaming this file to test_documents.py for proper test discovery.
# Adding basic test cases for the documents app.

import pytest
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Document

@pytest.mark.django_db
def test_document_creation():
    document = Document.objects.create(
        doc_title="Test Document",
        doc_type="PDF",
        doc_status="Active",
        doc_size=1024,
        doc_format="pdf",
        doc_category="Category1",
        doc_description="Test description",
    )
    # Introduce a fault: Expecting an incorrect title
    assert document.doc_title == "Incorrect Title"

@pytest.mark.django_db
def test_document_update():
    document = Document.objects.create(
        doc_title="Test Document",
        doc_type="PDF",
        doc_status="Active",
        doc_size=1024,
        doc_format="pdf",
        doc_category="Category1",
        doc_description="Test description",
    )
    document.doc_title = "Updated Document"
    document.save()
    assert document.doc_title == "Updated Document"

@pytest.mark.django_db
def test_document_deletion():
    document = Document.objects.create(
        doc_title="Test Document",
        doc_type="PDF",
        doc_status="Active",
        doc_size=1024,
        doc_format="pdf",
        doc_category="Category1",
        doc_description="Test description",
    )
    document_id = document.id
    document.delete()
    assert not Document.objects.filter(id=document_id).exists()