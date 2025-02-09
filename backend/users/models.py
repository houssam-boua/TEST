from django.db import models
from django.contrib.auth.models import AbstractUser
from rest_framework.authtoken.models import Token
from django.db.models.signals import post_save
from django.dispatch import receiver

class Departement(models.Model):
    dep_name = models.CharField(max_length=100)
    dep_type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.dep_name} - {self.dep_type}"

class Role(models.Model):
    role_name = models.CharField(max_length=100)
    role_type = models.TextField(max_length=100)

    def __str__(self):
        return self.role_name

class User(AbstractUser):
    # Note: The groups and user_permissions fields are already provided by AbstractUser.
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        # If this is a new instance (no primary key yet) and the password appears not to be hashed,
        # call set_password() to hash the plain-text password.
        if self.pk is None and self.password and not self.password.startswith('pbkdf2_'):
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} - {self.role}"

# Create a token automatically whenever a new user is created.
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
