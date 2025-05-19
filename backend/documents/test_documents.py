# Renaming this file to test_documents.py for proper test discovery.
# Adding basic test cases for the documents app.

from django.test import TestCase
from .models import Document

class DocumentModelTest(TestCase):
    def setUp(self):
        from users.models import User, Departement, Role
        self.departement = Departement.objects.create(dep_name="Engineering", dep_type="Technical")
        self.role = Role.objects.create(role_name="Developer", role_type="Technical")
        self.owner = User.objects.create_user(username="owner", password="pass123", role=self.role, departement=self.departement)

    def test_document_creation(self):
        document = Document.objects.create(
            doc_title="Test Document",
            doc_type="PDF",
            doc_status="Active",
            doc_size=1024,
            doc_format="pdf",
            doc_category="Category1",
            doc_description="Test description",
            doc_owner=self.owner,
            doc_departement=self.departement,
            doc_path="media/test.pdf"
        )
        self.assertEqual(document.doc_title, "Test Document")

    def test_document_update(self):
        document = Document.objects.create(
            doc_title="Test Document",
            doc_type="PDF",
            doc_status="Active",
            doc_size=1024,
            doc_format="pdf",
            doc_category="Category1",
            doc_description="Test description",
            doc_owner=self.owner,
            doc_departement=self.departement,
            doc_path="media/test.pdf"
        )
        document.doc_title = "Updated Document"
        document.save()
        self.assertEqual(document.doc_title, "Updated Document")

    def test_document_deletion(self):
        document = Document.objects.create(
            doc_title="Test Document",
            doc_type="PDF",
            doc_status="Active",
            doc_size=1024,
            doc_format="pdf",
            doc_category="Category1",
            doc_description="Test description",
            doc_owner=self.owner,
            doc_departement=self.departement,
            doc_path="media/test.pdf"
        )
        document_id = document.id
        document.delete()
        self.assertFalse(Document.objects.filter(id=document_id).exists())