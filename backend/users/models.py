from django.db import models
from django.contrib.auth.models import AbstractUser

from django.contrib.auth.models import AbstractUser
from django.db import models

class Departement(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self):
        return self.nom

class Utilisateur(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='utilisateur_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='utilisateur_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.'
    )
    role = models.CharField(max_length=50)
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.username} - {self.role}"
