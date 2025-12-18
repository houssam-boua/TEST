from django.db import models
from django.conf import settings
from django.core.files.storage import default_storage
from users.models import User, Departement

class DocumentCategory(models.Model):
    """
    Stores document categories (RH, MT, AC, GD).
    """
    code = models.CharField(max_length=2, unique=True, default='GD')
    name = models.CharField(max_length=128)
    description = models.TextField()

    def __str__(self):
        return f"{self.code} - {self.name}"

class DocumentNature(models.Model):
    """
    Stores document types (PR, PS, IT, EQ, FI).
    """
    code = models.CharField(max_length=2, unique=True, default='PR')
    name = models.CharField(max_length=128)
    description = models.TextField()

    def __str__(self):
        return f"{self.code} - {self.name}"

class Document(models.Model):
    """
    Represents a document in the system.
    Includes metadata such as title, type, status, and owner.
    """
    DOC_STATUS_TYPE_CHOICES = [
        ('ORIGINAL', 'Original'),
        ('COPIE', 'Copie'),
        ('PERIME', 'Périmé'),
    ]

    doc_title = models.CharField(max_length=1024)
    doc_type = models.CharField(max_length=50) # e.g., PDF, Word Document, Excel Spreadsheet
    doc_path = models.FileField(upload_to='', max_length=2048)
    doc_size = models.FloatField()
    doc_format = models.CharField(max_length=20)  # e.g., PDF, DOCX, XLSX
    doc_description = models.TextField()
    doc_owner = models.ForeignKey(User, on_delete=models.CASCADE)
    doc_departement = models.ForeignKey(Departement, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ISMS fields to keep:
    doc_code = models.CharField(max_length=20, unique=True, db_index=True)
    doc_category = models.ForeignKey(DocumentCategory, on_delete=models.PROTECT)
    doc_nature = models.ForeignKey(DocumentNature, on_delete=models.PROTECT)
    parent_document = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    sequential_number = models.PositiveIntegerField()
    doc_status_type = models.CharField(
        max_length=10,
        choices=DOC_STATUS_TYPE_CHOICES,
        default='ORIGINAL'
    )

    def delete(self, *args, **kwargs):
        # Delete file from storage
        if self.doc_path:
            self.doc_path.delete(save=False)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.doc_title} ({self.doc_type})"


class DocumentVersion(models.Model):
    """
    Represents a version of a document.
    Links to the main Document and includes version-specific metadata.
    """
    document = models.ForeignKey(Document, related_name='versions', on_delete=models.CASCADE)
    version_number = models.IntegerField()
    version_date = models.DateTimeField(auto_now_add=True)
    # Uses Django's default storage (configured in settings.py, e.g., Minio/S3 via DEFAULT_FILE_STORAGE)
    # Set max_length=255 for Minio/S3 compatibility (object key length limit)
    # Keep upload_to relative; storage backend is controlled by settings.DEFAULT_FILE_STORAGE
    version_path = models.FileField(upload_to="documents/versions/", max_length=255)
    version_comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        # Delete file from storage
        if self.version_path:
            self.version_path.delete(save=False)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Version {self.version_number} of {self.document.doc_title}"
