from django.db import models
from django.conf import settings
from django.core.files.storage import default_storage
from users.models import User, Departement


class Document(models.Model):
    """
    Represents a document in the system.
    Includes metadata such as title, type, status, and owner.
    """
    doc_title = models.CharField(max_length=1024)
    doc_type = models.CharField(max_length=50)
    doc_creation_date = models.DateTimeField(auto_now_add=True)
    doc_modification_date = models.DateTimeField(auto_now=True)
    # doc_deletion_date = models.DateTimeField(null=True, blank=True)
    # Uses Django's default storage (configured in settings.py, e.g., Minio/S3 via DEFAULT_FILE_STORAGE)
    # Set max_length=2048 for Minio/S3 compatibility (object key length limit)
    # Use a relative upload_to string. The actual storage backend is configured via
    # DEFAULT_FILE_STORAGE in settings.py (e.g. MinIO backend). Avoid passing a
    # storage instance here because that can get serialized into migrations.
    doc_path = models.FileField(upload_to='documents/', max_length=2048)

    doc_status = models.CharField(max_length=50)
    doc_size = models.FloatField()
    doc_format = models.CharField(max_length=20)
    doc_category = models.CharField(max_length=50)
    doc_description = models.TextField()
    doc_comment = models.TextField(blank=True)

    doc_owner = models.ForeignKey(User, on_delete=models.CASCADE)
    doc_departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
