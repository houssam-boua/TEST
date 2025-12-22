from django.db import models
from django.conf import settings
from django.core.files.storage import default_storage
from users.models import User, Departement

class Folder(models.Model):
    """
    Represents a folder in the document management system.
    Supports hierarchical parent-child relationships and index tracking.
    """
    fol_name = models.CharField(max_length=255)
    fol_path = models.CharField(max_length=1024)
    fol_index = models.CharField(max_length=5, default='GD')  # Not unique, allows multiple folders per index
    fol_order = models.PositiveIntegerField(null=True, blank=True, help_text='Order of PR folders within the parent folder')
    parent_folder = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subfolders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ['fol_index', 'fol_name']
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'
        constraints = [
            models.UniqueConstraint(fields=['fol_name', 'parent_folder'], name='unique_folder_name_in_parent')
        ]

    def __str__(self):
        return self.fol_name

    class Meta:
        ordering = ['fol_index', 'fol_name']
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'

    def get_full_path(self):
        """
        Returns the full folder path hierarchy as a string.
        """
        parts = [self.fol_name]
        parent = self.parent_folder
        while parent:
            parts.insert(0, parent.fol_name)
            parent = parent.parent_folder
        return '/'.join(parts)
  
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
    Stores document types (IT, ET, FI).
    """
    code = models.CharField(max_length=2, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField()

    @staticmethod
    def get_default_natures():
        return [
            {"code": "IT", "name": "Instruction de travail", "description": "Instruction de travail"},
            {"code": "ET", "name": "Enregistrement", "description": "Enregistrement"},
            {"code": "FI", "name": "Fiche", "description": "Fiche"},
        ]

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
    doc_path = models.FileField(upload_to='', max_length=2048)
    doc_type = models.CharField(max_length=50) # e.g., PDF, Word Document, Excel Spreadsheet
    doc_format = models.CharField(max_length=20)  # e.g., PDF, DOCX, XLSX
    doc_size = models.FloatField(null=True, blank=True)
    doc_description = models.TextField()

    doc_owner = models.ForeignKey(User, on_delete=models.CASCADE)
    doc_departement = models.ForeignKey(Departement, on_delete=models.CASCADE)
    
    doc_code = models.CharField(max_length=20, unique=True, db_index=True)
    # doc_category = models.ForeignKey(DocumentCategory, on_delete=models.PROTECT)
    doc_nature = models.ForeignKey(DocumentNature, on_delete=models.PROTECT)
    doc_nature_order = models.PositiveIntegerField(null=True, blank=True)
    doc_status_type = models.CharField(
        max_length=10,
        choices=DOC_STATUS_TYPE_CHOICES,
        default='ORIGINAL'
    )

    parent_document = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    parent_folder = models.ForeignKey(Folder, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_path_index(self):
        """
        Returns the path_index based on the parent folder's path_index.
        Format: parent_path_index-doc_nature_code-doc_nature_order
        """
        if not self.parent_folder:
            # No folder, just use nature and order
            if self.doc_nature_order is not None:
                formatted_order = f"0{self.doc_nature_order}" if self.doc_nature_order < 10 else str(self.doc_nature_order)
                return f"{self.doc_nature.code}-{formatted_order}"
            return self.doc_nature.code
        
        # Build folder path_index
        def build_folder_path(folder, parent_path_index=None):
            if folder.fol_order is not None:
                # Format order with leading zero if less than 10
                formatted_order = f"0{folder.fol_order}" if folder.fol_order < 10 else str(folder.fol_order)
                current_part = f"{folder.fol_index}-{formatted_order}"
            else:
                current_part = folder.fol_index
            
            if parent_path_index:
                return f"{parent_path_index}-{current_part}"
            return current_part
        
        # Recursively build the folder path
        def get_folder_full_path(folder):
            if folder.parent_folder:
                parent_path = get_folder_full_path(folder.parent_folder)
                return build_folder_path(folder, parent_path)
            return build_folder_path(folder)
        
        folder_path = get_folder_full_path(self.parent_folder)
        
        # Add document nature and order
        if self.doc_nature_order is not None:
            formatted_order = f"0{self.doc_nature_order}" if self.doc_nature_order < 10 else str(self.doc_nature_order)
            return f"{folder_path}-{self.doc_nature.code}-{formatted_order}"
        return f"{folder_path}-{self.doc_nature.code}"

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

  