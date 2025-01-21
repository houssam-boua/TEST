from django.db import models
from django.contrib.auth.models import AbstractUser

from django.contrib.auth.models import AbstractUser
from django.db import models

class Departement(models.Model):
    dep_name = models.CharField(max_length=100)
    dep_type = models.CharField(max_length=100)

    def __str__(self):
        return self.dep_name + " - " + self.dep_type

class Role(models.Model):
    role_name = models.CharField(max_length=100)
    role_type = models.TextField(max_length=100)

    def __str__(self):
        return self.role_name

class User(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.'
    )

    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.username} - {self.role}"
