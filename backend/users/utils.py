# backend/users/utils.py
# Purpose: Permission helper utilities used across views, middleware and templates.
# Provides efficient queries to compute effective permissions (groups + user_permissions)
# and small helper predicates to support OR/AND permission checks.
from __future__ import annotations

from typing import Iterable, Set
import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission, Group

User = get_user_model()
logger = logging.getLogger("permissions")


def get_effective_permissions(user: User) -> Set[str]:
    """
    Return a set of permission strings in the form "app_label.codename" for the given user.
    Aggregates direct user permissions and group permissions efficiently (avoids N+1).
    Defensive: returns empty set for anonymous or unsaved users.
    """
    if user is None or not getattr(user, "pk", None):
        return set()

    if getattr(user, "is_superuser", False):
        qs = Permission.objects.select_related("content_type").all()
        return {f"{p.content_type.app_label}.{p.codename}" for p in qs if p.content_type and p.codename}

    # Direct user permissions
    user_perms_qs = user.user_permissions.select_related("content_type").all()

    # Group permissions: query permissions that are linked to groups this user belongs to in one go
    group_perms_qs = Permission.objects.select_related("content_type").filter(group__user=user).distinct()

    perms = set()
    # iterate both querysets without causing extra queries per item
    for p in user_perms_qs:
        ct = getattr(p, "content_type", None)
        if ct and p.codename:
            perms.add(f"{ct.app_label}.{p.codename}")

    for p in group_perms_qs:
        ct = getattr(p, "content_type", None)
        if ct and p.codename:
            perms.add(f"{ct.app_label}.{p.codename}")

    return perms


def has_any_permission(user: User, perms: Iterable[str]) -> bool:
    """
    Return True if the user has at least one of the permissions in `perms`.
    `perms` are strings like "app_label.codename".
    """
    if not perms:
        return False
    if user is None:
        return False
    if getattr(user, "is_superuser", False):
        return True
    effective = get_effective_permissions(user)
    return any(p in effective for p in perms)


def has_all_permissions(user: User, perms: Iterable[str]) -> bool:
    """
    Return True if the user has all permissions in `perms`.
    """
    if perms is None:
        return True
    if user is None:
        return False
    if getattr(user, "is_superuser", False):
        return True
    effective = get_effective_permissions(user)
    return all(p in effective for p in perms)


def is_in_group(user: User, group_name: str) -> bool:
    """
    Case-insensitive membership check for Django Group.
    """
    if user is None or not group_name:
        return False
    try:
        return user.groups.filter(name__iexact=group_name).exists()
    except Exception:
        logger.exception("is_in_group failed for user=%s group=%s", getattr(user, "pk", None), group_name)
        return False