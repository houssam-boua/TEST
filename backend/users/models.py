from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


class Departement(models.Model):
    """
    Represents a department within the organization.
    """
    dep_name = models.CharField(max_length=100)
    dep_type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.dep_name} - {self.dep_type}"


class Role(models.Model):
    """
    Represents a role assigned to a user.
    """
    role_name = models.CharField(max_length=100)
    role_type = models.TextField(max_length=100)

    def __str__(self):
        return self.role_name


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    Includes additional fields for role and department.
    """
    # Note: The groups and user_permissions fields are already provided by AbstractUser.
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        # If this is a new instance (no primary key yet) and the password appears not to be hashed,
        # call set_password() to hash the plain-text password.
        if (
            self.pk is None
            and self.password
            and not self.password.startswith("pbkdf2_")
        ):
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} - {self.role}"

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class UserActionLog(models.Model):
    """
    Logs user actions (create, update, delete) on any object.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=32)  # e.g. 'create', 'update', 'delete'
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    target_object = GenericForeignKey('content_type', 'object_id')
    timestamp = models.DateTimeField(auto_now_add=True)
    extra_info = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} {self.action} {self.content_type} {self.object_id} at {self.timestamp}"

# Create a token automatically whenever a new user is created.
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
