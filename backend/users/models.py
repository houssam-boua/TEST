# backend/users/models.py
# Purpose: core user models and minimal audit models used by the permissions system.
# Note: If a new model is added (PermissionAudit) a migration must be created separately:
#   python manage.py makemigrations users
#   python manage.py migrate
from __future__ import annotations

from typing import Iterable, Set, Optional

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

import logging

logger = logging.getLogger(__name__)

# ✅ ADDED: Site Model
class Site(models.Model):
    """
    Represents a physical location or site (e.g., Headquarters, Factory A).
    """
    name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class Departement(models.Model):
    """
    Represents a department within the organization, associated with a specific Site.
    """
    # ✅ UPDATED: Link to Site
    site = models.ForeignKey(
        Site, 
        on_delete=models.CASCADE, 
        related_name='departements',
        null=True, 
        blank=True
    )
    dep_name = models.CharField(max_length=100) # Removed unique=True to allow duplicate names across sites
    dep_color = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensures uniqueness per site (e.g. Site A can have HR, Site B can have HR)
        unique_together = ('dep_name', 'site')

    def __str__(self) -> str:
        site_name = self.site.name if self.site else "No Site"
        return f"{self.dep_name} ({site_name}) - {self.dep_color}"


class Role(models.Model):
    """
    Represents a role assigned to a user.
    """
    role_name = models.CharField(max_length=100, unique=True)
    role_color = models.TextField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.role_name


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    Adds convenience permission/group helper methods used by the project.
    These methods are defensive (handle unsaved users) and try to avoid N+1 queries.
    """
    # groups and user_permissions exist on AbstractUser
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    # cached property name used to avoid repeated DB lookups within the same process/object lifetime
    _effective_permissions_cache: Optional[Set[str]] = None

    def save(self, *args, **kwargs) -> None:
        # If this is a new instance (no primary key yet) and the password appears not to be hashed,
        # call set_password() to hash the plain-text password.
        if (
            self.pk is None
            and self.password
            and not self.password.startswith("pbkdf2_")
        ):
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.username} - {self.role}"

    # -----------------------
    # Permission convenience helpers
    # -----------------------
    def get_effective_permissions(self) -> Set[str]:
        """
        Return a set of permissions in the form "app_label.codename" that the user has,
        aggregated from:
          - explicit user.user_permissions
          - permissions granted to groups the user is a member of

        Caches the result on the instance to avoid repeated DB hits during a request lifecycle.
        For superusers, returns all permissions present in the system.
        """
        if getattr(self, "_effective_permissions_cache", None) is not None:
            return self._effective_permissions_cache  # type: ignore[return-value]

        if not self.pk:
            perms: Set[str] = set()
            self._effective_permissions_cache = perms
            return perms

        if self.is_superuser:
            # Superuser: return all permission strings (may be heavy but accurate)
            qs = Permission.objects.select_related("content_type").all()
        else:
            # user permissions (direct)
            user_perms_qs = self.user_permissions.select_related("content_type").all()

            # group permissions: query Permission via groups to avoid iterating groups separately
            group_perms_qs = Permission.objects.select_related("content_type").filter(group__user=self).distinct()

            # combine querysets using union-like iteration without additional queries per permission
            # convert to a set of "app_label.codename"
            qs = user_perms_qs.union(group_perms_qs) if hasattr(user_perms_qs, 'union') else list(user_perms_qs) + list(group_perms_qs)

        perms: Set[str] = set()
        try:
            # handle both queryset and list
            for p in qs:
                ct = getattr(p, "content_type", None)
                if ct is None:
                    continue
                app = getattr(ct, "app_label", None)
                codename = getattr(p, "codename", None)
                if app and codename:
                    perms.add(f"{app}.{codename}")
        except Exception:
            # Defensive fallback: use Django built-ins
            perms = set(self.get_all_permissions())

        self._effective_permissions_cache = perms
        return perms

    def has_any_permission(self, permission_list: Iterable[str]) -> bool:
        """
        Return True if the user has at least one permission in permission_list.
        permission_list contains permission identifiers like "app_label.codename".
        """
        if self.is_superuser:
            return True
        if not permission_list:
            return False
        effective = self.get_effective_permissions()
        return any(p in effective for p in permission_list)

    def has_all_permissions(self, permission_list: Iterable[str]) -> bool:
        """
        Return True only if the user has all permissions in permission_list.
        """
        if self.is_superuser:
            return True
        if not permission_list:
            return True
        effective = self.get_effective_permissions()
        return all(p in effective for p in permission_list)

    def assign_group(self, group_name: str) -> Group:
        """
        Add the user to a group by name (case-insensitive). Returns the Group instance.
        Raises Group.DoesNotExist if not found.
        """
        group = Group.objects.get(name__iexact=group_name)
        # using add avoids replacing other groups
        self.groups.add(group)
        # clear cached permissions so subsequent checks reflect change
        self._effective_permissions_cache = None
        return group

    def remove_group(self, group_name: str) -> None:
        """
        Remove the user from a group by name (case-insensitive). No-op if group not present.
        """
        try:
            group = Group.objects.get(name__iexact=group_name)
        except Group.DoesNotExist:
            return
        self.groups.remove(group)
        self._effective_permissions_cache = None

    def is_in_group(self, group_name: str) -> bool:
        """
        Case-insensitive check whether a user belongs to a group.
        """
        if not group_name:
            return False
        return self.groups.filter(name__iexact=group_name).exists()


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

    def __str__(self) -> str:
        return f"{self.user} {self.action} {self.content_type} {self.object_id} at {self.timestamp}"


class PermissionAudit(models.Model):
    """
    Optional: lightweight audit model to record permission/group changes and management command seeds.
    Minimal fields only. If you add this model in the DB, create a migration:
      python manage.py makemigrations users
      python manage.py migrate
    """
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="permission_audit_actor")
    # target can be a user, group or permission; we store polymorphically
    target_content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.SET_NULL)
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    action = models.CharField(max_length=64)
    details = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"{self.action} by {self.actor} at {self.timestamp}"


# Create a token automatically whenever a new user is created.
@receiver(post_save, sender=User)
def create_auth_token(sender, instance: User | None = None, created: bool = False, **kwargs) -> None:
    if created:
        try:
            Token.objects.create(user=instance)
        except Exception:
            logger.exception("Failed to create auth token for new user: %s", instance)