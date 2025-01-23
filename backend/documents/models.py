from django.db import models
from users.models import User, Departement


class Document(models.Model):
    doc_title = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=50)
    doc_creation_date = models.DateTimeField(auto_now_add=True)
    doc_modification_date = models.DateTimeField(auto_now=True)
    # doc_deletion_date = models.DateTimeField(null=True, blank=True)
    doc_path = models.FileField(upload_to='documents/')
    doc_status = models.CharField(max_length=50)
    doc_size = models.FloatField()
    doc_format = models.CharField(max_length=20)
    doc_category = models.CharField(max_length=50)
    doc_description = models.TextField()
    doc_comment = models.TextField(blank=True)

    doc_owner = models.ForeignKey(User, on_delete=models.CASCADE)
    doc_departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.doc_title} ({self.doc_type})"

    