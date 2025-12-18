import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from documents.models import (
    DocumentCategory, DocumentNature, Document
)
from documents.utils import (
    generate_document_code, validate_document_code, get_next_sequential_number
)
from documents.serializers import (
    DocumentCategorySerializer, DocumentNatureSerializer, DocumentSerializer
)

User = get_user_model()

# ---------------------- Model Tests ----------------------

class DocumentCategoryModelTest(TestCase):
    """Test DocumentCategory model"""

    def setUp(self):
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")

    def test_create_category(self):
        """Test creating a document category"""
        self.assertEqual(self.cat.code, "GD")
        self.assertEqual(str(self.cat), "GD - Gestion")

    def test_unique_code_constraint(self):
        """Test unique code constraint"""
        with self.assertRaises(IntegrityError):
            DocumentCategory.objects.create(code="GD", name="Duplicate", description="Dup")

    def test_field_validations(self):
        """Test field validations"""
        cat = DocumentCategory(code="RH", name="", description="")
        with self.assertRaises(ValidationError):
            cat.full_clean()

class DocumentNatureModelTest(TestCase):
    """Test DocumentNature model"""

    def setUp(self):
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")

    def test_create_nature(self):
        self.assertEqual(self.nature.code, "PR")
        self.assertEqual(str(self.nature), "PR - Procédure")

    def test_unique_code_constraint(self):
        with self.assertRaises(IntegrityError):
            DocumentNature.objects.create(code="PR", name="Dup", description="Dup")

    def test_field_validations(self):
        nature = DocumentNature(code="PS", name="", description="")
        with self.assertRaises(ValidationError):
            nature.full_clean()

class DocumentVersionModelTest(TestCase):
    """Test DocumentVersion model"""

    def setUp(self):
        self.user = User.objects.create(username="testuser")
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.doc = Document.objects.create(
            doc_title="Doc1", doc_type="PDF", doc_path="doc1.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-01", doc_category=self.cat, doc_nature=self.nature
        )
        self.version = DocumentVersion.objects.create(
            document=self.doc, version_number="01", doc_code="GD-PR-01", created_by=self.user, is_current=True
        )

    def test_version_creation(self):
        self.assertEqual(self.version.version_number, "01")
        self.assertEqual(self.version.document, self.doc)

    def test_is_current_flag(self):
        self.assertTrue(self.version.is_current)

    def test_relationships(self):
        self.assertEqual(self.version.created_by, self.user)

    def test_modification_notes(self):
        self.version.modification_notes = "Initial version"
        self.version.save()
        self.assertEqual(self.version.modification_notes, "Initial version")

    def test_cascade_deletion(self):
        self.doc.delete()
        self.assertFalse(DocumentVersion.objects.filter(id=self.version.id).exists())

class DocumentDistributionModelTest(TestCase):
    """Test DocumentDistribution model"""

    def setUp(self):
        self.user = User.objects.create(username="distuser")
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.doc = Document.objects.create(
            doc_title="Doc2", doc_type="PDF", doc_path="doc2.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-02", doc_category=self.cat, doc_nature=self.nature
        )
        self.version = DocumentVersion.objects.create(
            document=self.doc, version_number="01", doc_code="GD-PR-02", created_by=self.user, is_current=True
        )
        self.dist = DocumentDistribution.objects.create(
            document_version=self.version, recipient=self.user, copy_type="ORIGINAL"
        )

    def test_distribution_creation(self):
        self.assertEqual(self.dist.document_version, self.version)
        self.assertEqual(self.dist.recipient, self.user)

    def test_acknowledgment_workflow(self):
        self.assertIsNone(self.dist.acknowledged_at)
        self.dist.acknowledged_at = timezone.now()
        self.dist.save()
        self.assertIsNotNone(self.dist.acknowledged_at)

    def test_copy_type_choices(self):
        self.assertIn(self.dist.copy_type, ["ORIGINAL", "COPIE"])

class DocumentArchiveModelTest(TestCase):
    """Test DocumentArchive model"""

    def setUp(self):
        self.user = User.objects.create(username="archiveuser")
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.doc = Document.objects.create(
            doc_title="Doc3", doc_type="PDF", doc_path="doc3.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-03", doc_category=self.cat, doc_nature=self.nature
        )
        self.version = DocumentVersion.objects.create(
            document=self.doc, version_number="01", doc_code="GD-PR-03", created_by=self.user, is_current=True
        )
        self.archive = DocumentArchive.objects.create(
            document=self.doc, version=self.version, archived_by=self.user,
            retention_until=timezone.now() + timezone.timedelta(days=3*365),
            archive_status="ACTIVE"
        )

    def test_archive_creation(self):
        self.assertEqual(self.archive.document, self.doc)
        self.assertEqual(self.archive.version, self.version)

    def test_retention_until_calculation(self):
        self.assertTrue(self.archive.retention_until > timezone.now())

    def test_archive_status_choices(self):
        self.assertIn(self.archive.archive_status, ["ACTIVE", "PERIME"])

# Enhanced Document model tests (doc_code uniqueness, parent, status, review, etc.)
class EnhancedDocumentModelTest(TestCase):
    """Test enhanced Document model"""

    def setUp(self):
        self.user = User.objects.create(username="enhanceduser")
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.doc = Document.objects.create(
            doc_title="Doc4", doc_type="PDF", doc_path="doc4.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-04", doc_category=self.cat, doc_nature=self.nature,
            sequential_number=1, doc_status_type="ORIGINAL"
        )

    def test_doc_code_uniqueness(self):
        with self.assertRaises(IntegrityError):
            Document.objects.create(
                doc_title="Dup", doc_type="PDF", doc_path="dup.pdf", doc_status="draft",
                doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
                doc_departement_id=1, doc_code="GD-PR-04", doc_category=self.cat, doc_nature=self.nature
            )

    def test_parent_document_relationship(self):
        child = Document.objects.create(
            doc_title="Child", doc_type="PDF", doc_path="child.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-04-IT-01", doc_category=self.cat, doc_nature=self.nature,
            parent_document=self.doc
        )
        self.assertEqual(child.parent_document, self.doc)

    def test_sequential_number(self):
        self.assertEqual(self.doc.sequential_number, 1)

    def test_doc_status_type_choices(self):
        self.assertIn(self.doc.doc_status_type, ["ORIGINAL", "COPIE", "PERIME"])

    def test_next_review_due_calculation(self):
        self.doc.last_reviewed_at = timezone.now()
        self.doc.next_review_due = self.doc.last_reviewed_at + timezone.timedelta(days=365)
        self.doc.save()
        self.assertTrue(self.doc.next_review_due > self.doc.last_reviewed_at)

    def test_is_archived_flag(self):
        self.doc.is_archived = True
        self.doc.save()
        self.assertTrue(self.doc.is_archived)

# ---------------------- Utils Tests ----------------------

class CodeGenerationUtilsTest(TestCase):
    """Test code generation utilities"""

    def setUp(self):
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature_pr = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.nature_it = DocumentNature.objects.create(code="IT", name="Instruction", description="Instruction")
        self.user = User.objects.create(username="utilsuser")
        self.doc = Document.objects.create(
            doc_title="Doc5", doc_type="PDF", doc_path="doc5.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-01", doc_category=self.cat, doc_nature=self.nature_pr
        )

    def test_generate_process_code(self):
        code = generate_document_code("GD", "PR")
        self.assertTrue(code.startswith("GD-PR-"))
        self.assertTrue(validate_document_code(code))

    def test_generate_work_instruction_code(self):
        code = generate_document_code("GD", "IT", parent_code="GD-PR-01")
        self.assertTrue(code.startswith("GD-PR-01-"))
        self.assertTrue(validate_document_code(code))

    def test_sequential_numbering(self):
        code1 = generate_document_code("GD", "PR")
        code2 = generate_document_code("GD", "PR")
        self.assertNotEqual(code1, code2)

    def test_duplicate_detection(self):
        code = generate_document_code("GD", "PR")
        with self.assertRaises(ValueError):
            generate_document_code("GD", "PR", parent_code=None)

    def test_error_handling_invalid_inputs(self):
        with self.assertRaises(ValueError):
            generate_document_code("X", "PR")
        with self.assertRaises(ValueError):
            generate_document_code("GD", "X")
        with self.assertRaises(ValueError):
            generate_document_code("GD", "IT")
        with self.assertRaises(ValueError):
            generate_document_code("GD", "PR", parent_code="GD-PR-01")

    def test_get_next_sequential_number(self):
        seq = get_next_sequential_number(self.cat, self.nature_pr)
        self.assertTrue(seq >= 1)

    def test_get_next_sequential_number_with_gaps(self):
        # Simulate gaps
        Document.objects.create(
            doc_title="DocGap", doc_type="PDF", doc_path="gap.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-05", doc_category=self.cat, doc_nature=self.nature_pr
        )
        seq = get_next_sequential_number(self.cat, self.nature_pr)
        self.assertTrue(seq >= 1)

    def test_maximum_number_handling(self):
        # Simulate 99 docs
        for i in range(1, 100):
            Document.objects.create(
                doc_title=f"Doc{i}", doc_type="PDF", doc_path=f"doc{i}.pdf", doc_status="draft",
                doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
                doc_departement_id=1, doc_code=f"GD-PR-{i:02d}", doc_category=self.cat, doc_nature=self.nature_pr
            )
        with self.assertRaises(ValueError):
            generate_document_code("GD", "PR")

    def test_validate_document_code(self):
        self.assertTrue(validate_document_code("GD-PR-01"))
        self.assertTrue(validate_document_code("GD-PR-01-IT-01"))
        self.assertFalse(validate_document_code("GD-PR"))
        self.assertFalse(validate_document_code("GD-PR-XX"))

# ---------------------- Serializer Tests ----------------------

class DocumentCategorySerializerTest(TestCase):
    def test_serialization(self):
        cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        data = DocumentCategorySerializer(cat).data
        self.assertEqual(data["code"], "GD")

    def test_deserialization(self):
        data = {"code": "RH", "name": "RH", "description": "RH"}
        serializer = DocumentCategorySerializer(data=data)
        self.assertTrue(serializer.is_valid())

class DocumentNatureSerializerTest(TestCase):
    def test_serialization(self):
        nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        data = DocumentNatureSerializer(nature).data
        self.assertEqual(data["code"], "PR")

    def test_deserialization(self):
        data = {"code": "PS", "name": "Procédure Spéciale", "description": "Desc"}
        serializer = DocumentNatureSerializer(data=data)
        self.assertTrue(serializer.is_valid())

class DocumentVersionSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="serialusertest")
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.doc = Document.objects.create(
            doc_title="Doc6", doc_type="PDF", doc_path="doc6.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-06", doc_category=self.cat, doc_nature=self.nature
        )
        self.version = DocumentVersion.objects.create(
            document=self.doc, version_number="01", doc_code="GD-PR-06", created_by=self.user, is_current=True
        )

    def test_serialization_with_nested_user(self):
        data = DocumentVersionSerializer(self.version).data
        self.assertEqual(data["created_by"]["username"], "serialusertest")

    def test_deserialization(self):
        data = {
            "document": self.doc.id, "version_number": "02", "doc_code": "GD-PR-06",
            "created_by": self.user.id, "is_current": False
        }
        serializer = DocumentVersionSerializer(data=data)
        self.assertTrue(serializer.is_valid())

class DocumentDistributionSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="distseruser")
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.doc = Document.objects.create(
            doc_title="Doc7", doc_type="PDF", doc_path="doc7.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-07", doc_category=self.cat, doc_nature=self.nature
        )
        self.version = DocumentVersion.objects.create(
            document=self.doc, version_number="01", doc_code="GD-PR-07", created_by=self.user, is_current=True
        )
        self.dist = DocumentDistribution.objects.create(
            document_version=self.version, recipient=self.user, copy_type="ORIGINAL"
        )

    def test_serialization(self):
        data = DocumentDistributionSerializer(self.dist).data
        self.assertEqual(data["recipient"]["username"], "distseruser")

    def test_deserialization(self):
        data = {
            "document_version": self.version.id, "recipient": self.user.id,
            "copy_type": "ORIGINAL"
        }
        serializer = DocumentDistributionSerializer(data=data)
        self.assertTrue(serializer.is_valid())

class DocumentArchiveSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="archiveseruser")
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")
        self.doc = Document.objects.create(
            doc_title="Doc8", doc_type="PDF", doc_path="doc8.pdf", doc_status="draft",
            doc_size=1.2, doc_format="PDF", doc_description="desc", doc_owner=self.user,
            doc_departement_id=1, doc_code="GD-PR-08", doc_category=self.cat, doc_nature=self.nature
        )
        self.version = DocumentVersion.objects.create(
            document=self.doc, version_number="01", doc_code="GD-PR-08", created_by=self.user, is_current=True
        )
        self.archive = DocumentArchive.objects.create(
            document=self.doc, version=self.version, archived_by=self.user,
            retention_until=timezone.now() + timezone.timedelta(days=3*365),
            archive_status="ACTIVE"
        )

    def test_serialization(self):
        data = DocumentArchiveSerializer(self.archive).data
        self.assertEqual(data["archived_by"]["username"], "archiveseruser")

    def test_deserialization(self):
        data = {
            "document": self.doc.id, "version": self.version.id, "archived_by": self.user.id,
            "retention_until": timezone.now() + timezone.timedelta(days=3*365),
            "archive_status": "ACTIVE"
        }
        serializer = DocumentArchiveSerializer(data=data)
        self.assertTrue(serializer.is_valid())

# ---------------------- API/ViewSet Tests ----------------------

class DocumentCategoryViewSetAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = DocumentCategory.objects.create(code="GD", name="Gestion", description="Gestion Docs")

    def test_list(self):
        response = self.client.get("/documents/document-categories/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve(self):
        response = self.client.get(f"/documents/document-categories/{self.cat.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create(self):
        data = {"code": "RH", "name": "RH", "description": "RH"}
        response = self.client.post("/documents/document-categories/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update(self):
        data = {"name": "Gestion Updated", "description": "Updated"}
        response = self.client.patch(f"/documents/document-categories/{self.cat.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete(self):
        response = self.client.delete(f"/documents/document-categories/{self.cat.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class DocumentNatureViewSetAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.nature = DocumentNature.objects.create(code="PR", name="Procédure", description="Procédure")

    def test_list(self):
        response = self.client.get("/documents/document-natures/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve(self):
        response = self.client.get(f"/documents/document-natures/{self.nature.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create(self):
        data = {"code": "PS", "name": "Procédure Spéciale", "description": "Desc"}
        response = self.client.post("/documents/document-natures/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update(self):
        data = {"name": "Procédure Updated", "description": "Updated"}
        response = self.client.patch(f"/documents/document-natures/{self.nature.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete(self):
        response = self.client.delete(f"/documents/document-natures/{self.nature.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

# Removed workflow and integration tests for version/distribution/archive as part of ISMS simplification.
