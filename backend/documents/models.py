from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.files.storage import default_storage

from users.models import User, Departement


# ✅ NEW: Site Model
class Site(models.Model):
    """
    Represents a physical location or site (e.g., Headquarters, Factory A).
    """
    name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name


# ✅ NEW: DocumentType Model
class DocumentType(models.Model):
    """
    Defines the type of document (e.g., Procedure, Manual) for classification
    and index generation logic (e.g., PROC-01, MAN-05).
    """
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True, help_text="Prefix for document index (e.g. PROC, MAN)")
    description = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.name} ({self.code})"


class Folder(models.Model):
    """
    Represents a folder in the document management system.
    Supports hierarchical parent-child relationships and index tracking.
    """
    fol_name = models.CharField(max_length=255)
    fol_path = models.CharField(max_length=1024, blank=True, default="")
    fol_index = models.CharField(max_length=5, default="GD")  # Not unique
    fol_order = models.PositiveIntegerField(
        null=True, blank=True, help_text="Order of PR folders within the parent folder"
    )

    parent_folder = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="subfolders",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    # ✅ ARCHIVING (folder)
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_until = models.DateTimeField(null=True, blank=True)  # null => permanent
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="archived_folders",
    )
    archived_note = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["fol_index", "fol_name"]
        verbose_name = "Folder"
        verbose_name_plural = "Folders"
        constraints = [
            models.UniqueConstraint(
                fields=["fol_name", "parent_folder"],
                name="unique_folder_name_in_parent",
            )
        ]
        indexes = [
            models.Index(fields=["is_archived"]),
            models.Index(fields=["archived_until"]),
        ]

    def __str__(self):
        return self.fol_name

    def get_full_path(self):
        parts = [self.fol_name]
        parent = self.parent_folder
        while parent:
            parts.insert(0, parent.fol_name)
            parent = parent.parent_folder
        return "/".join(parts)


class DocumentCategory(models.Model):
    """
    Stores document categories (RH, MT, AC, GD).
    """
    code = models.CharField(max_length=2, unique=True, default="GD")
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.code} - {self.name}"


class DocumentNature(models.Model):
    """
    Stores legacy document natures (IT, ET, FI).
    """
    code = models.CharField(max_length=2, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default="")

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
    Represents a document in the system (current/latest file + metadata).
    """
    DOC_STATUS_TYPE_CHOICES = [
        ("ORIGINAL", "Original"),
        ("COPIE", "Copie"),
        ("PERIME", "Périmé"),
    ]

    # mLean linkage (optional)
    mlean_document_id = models.IntegerField(null=True, blank=True, db_index=True)
    mlean_paper_standard_id = models.IntegerField(null=True, blank=True, db_index=True)  # paper-standards id
    mlean_standard_id = models.IntegerField(null=True, blank=True, db_index=True)  # standards root id

    doc_title = models.CharField(max_length=1024)

    # IMPORTANT: keep upload_to="" because you explicitly set keys in views with doc_path.save(key,...)
    doc_path = models.FileField(upload_to="", max_length=2048)

    doc_type = models.CharField(max_length=50)  # e.g., PDF, Word Document
    doc_format = models.CharField(max_length=20)  # e.g., pdf, docx, xlsx
    doc_size = models.FloatField(null=True, blank=True)

    doc_description = models.TextField(blank=True, default="")

    doc_owner = models.ForeignKey(User, on_delete=models.CASCADE)
    doc_departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    doc_code = models.CharField(max_length=20, unique=True, db_index=True)

    # ✅ NEW FIELDS: Site and Document Type support
    site = models.ForeignKey(Site, on_delete=models.SET_NULL, null=True, blank=True)
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Stores the incremental number specific to the DocumentType (e.g., the '5' in 'PROC-5')
    document_type_order = models.PositiveIntegerField(null=True, blank=True)

    # Legacy/Fallback fields
    doc_nature = models.ForeignKey(DocumentNature, on_delete=models.PROTECT)
    doc_nature_order = models.PositiveIntegerField(null=True, blank=True)

    doc_status_type = models.CharField(
        max_length=10,
        choices=DOC_STATUS_TYPE_CHOICES,
        default="ORIGINAL",
    )

    parent_document = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE)
    parent_folder = models.ForeignKey(Folder, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ✅ ARCHIVING (document)
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_until = models.DateTimeField(null=True, blank=True)  # null => permanent
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="archived_documents",
    )
    archive_note = models.TextField(blank=True, default="")  # helpful for UI/search

    class Meta:
        indexes = [
            models.Index(fields=["is_archived"]),
            models.Index(fields=["archived_until"]),
            models.Index(fields=["mlean_document_id"]),
            models.Index(fields=["mlean_paper_standard_id"]),
            models.Index(fields=["mlean_standard_id"]),
        ]

    def get_path_index(self):
        """
        Returns the path_index based on the parent folder's hierarchy.
        Logic updated to prefer DocumentType code if available, otherwise falls back to doc_nature.
        """

        def build_folder_part(folder):
            if folder.fol_order is not None:
                formatted_order = f"0{folder.fol_order}" if folder.fol_order < 10 else str(folder.fol_order)
                return f"{folder.fol_index}-{formatted_order}"
            return folder.fol_index

        def folder_path_index(folder):
            parts = []
            cur = folder
            while cur:
                parts.insert(0, build_folder_part(cur))
                cur = cur.parent_folder
            return "-".join(parts)

        folder_part = folder_path_index(self.parent_folder) if self.parent_folder else ""

        # Use DocumentType logic if available
        if self.document_type and self.document_type_order is not None:
             formatted_order = str(self.document_type_order)
             # Optional: pad with zero if needed, e.g. f"{self.document_type_order:02d}"
             doc_part = f"{self.document_type.code}-{formatted_order}"
        
        # Fallback to old Nature logic
        elif self.doc_nature_order is not None:
            formatted_doc_order = f"0{self.doc_nature_order}" if self.doc_nature_order < 10 else str(self.doc_nature_order)
            doc_part = f"{self.doc_nature.code}-{formatted_doc_order}"
        else:
            doc_part = self.doc_nature.code

        return f"{folder_part}-{doc_part}" if folder_part else doc_part

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
    """
    CHANGE_TYPE_CHOICES = [
        ("MINOR", "Minor"),
        ("AUDITABLE", "Auditable"),
    ]

    document = models.ForeignKey(Document, related_name="versions", on_delete=models.CASCADE)

    version_number = models.IntegerField()
    version_date = models.DateTimeField(auto_now_add=True)

    change_type = models.CharField(
        max_length=10,
        choices=CHANGE_TYPE_CHOICES,
        default="MINOR",
    )

    # NOTE: upload_to already includes "documents/versions/".
    # Save ONLY the relative part (e.g. "17/v2_file.pdf") to avoid double prefix.
    version_path = models.FileField(upload_to="documents/versions/", max_length=2048)

    version_comment = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-version_number", "-version_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["document", "version_number"],
                name="unique_version_per_document",
            )
        ]

    def delete(self, *args, **kwargs):
        if self.version_path:
            self.version_path.delete(save=False)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Version {self.version_number} of {self.document.doc_title}"


class DocumentArchive(models.Model):
    """
    Archive history table.

    One row per archive action, so you keep history even if the document is restored later.
    """
    STATUS_ACTIVE = "ACTIVE"
    STATUS_RESTORED = "RESTORED"
    STATUS_EXPIRED = "EXPIRED"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "ACTIVE"),
        (STATUS_RESTORED, "RESTORED"),
        (STATUS_EXPIRED, "EXPIRED"),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="archive_records",
    )

    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="document_archive_actions",
    )

    archived_at = models.DateTimeField(default=timezone.now)
    retention_until = models.DateTimeField(null=True, blank=True)  # null => permanent archive

    restored_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    note = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-archived_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["retention_until"]),
            models.Index(fields=["archived_at"]),
        ]

    def __str__(self):
        return f"Archive({self.document_id}) {self.status}"