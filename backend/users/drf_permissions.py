# backend/users/drf_permissions.py
# Purpose: DRF permission classes used across ViewSets to express OR/AND permission logic
# and an object-level permission class that consults django-guardian (if installed) then falls
# back to group/user permissions.
from __future__ import annotations

from typing import Iterable, List

from rest_framework import permissions
from django.contrib.auth.models import Permission
from django.conf import settings
import logging

logger = logging.getLogger("permissions")

try:
    # optional import: django-guardian provides object permission helpers
    from guardian.shortcuts import get_perms
    GUARDIAN_AVAILABLE = True
except Exception:
    GUARDIAN_AVAILABLE = False


class AnyPermission(permissions.BasePermission):
    """
    Allow access if the user has any of the provided permissions.
    Usage in a viewset:
        permission_classes = [AnyPermission]
        permission_required = ["app_label.codename", "other_app.codename"]
    """
    def has_permission(self, request, view):
        required = getattr(view, "permission_required", None) or getattr(view, "permission_required_any", None)
        if not required:
            return True
        if request.user and request.user.is_authenticated and request.user.is_superuser:
            return True
        user_perms = set()
        try:
            # try to reuse method on user if available
            if hasattr(request.user, "get_effective_permissions"):
                user_perms = request.user.get_effective_permissions()
            else:
                # fallback to Django has_perm calls (may be slower)
                user_perms = {f"{p.content_type.app_label}.{p.codename}" for p in Permission.objects.filter(user=request.user)}
        except Exception:
            logger.exception("AnyPermission failure while collecting permissions")
        return any(p in user_perms for p in required)


class AllPermissions(permissions.BasePermission):
    """
    Allow access only if the user has all of the provided permissions.
    Usage: similar to AnyPermission, set `permission_required` on the view.
    """
    def has_permission(self, request, view):
        required = getattr(view, "permission_required", None) or getattr(view, "permission_required_all", None)
        if required is None:
            return True
        if request.user and request.user.is_authenticated and request.user.is_superuser:
            return True
        try:
            if hasattr(request.user, "get_effective_permissions"):
                user_perms = request.user.get_effective_permissions()
            else:
                user_perms = {f"{p.content_type.app_label}.{p.codename}" for p in Permission.objects.filter(user=request.user)}
        except Exception:
            logger.exception("AllPermissions failure while collecting permissions")
            user_perms = set()
        return all(p in user_perms for p in required)


class ObjectOrGlobalPermission(permissions.BasePermission):
    """
    DRF permission that checks object-level permissions (via django-guardian/backends)
    and falls back to global/group/user permissions.
    View / viewset must provide:
      - permission_required (list of perm strings) or permission_required_any / permission_required_all
    The object-level check happens in has_object_permission; has_permission checks global perms.
    """
    def _perm_strings(self, required) -> List[str]:
        if not required:
            return []
        return list(required)

    def has_permission(self, request, view):
        # Reuse AllPermissions/AnyPermissions logic for global permission checks.
        # If view sets permission_scope = "any" use OR logic, otherwise AND.
        scope = getattr(view, "permission_scope", "all")
        required = getattr(view, "permission_required", None) or getattr(view, "permission_required_all", None) or getattr(view, "permission_required_any", None)
        if not required:
            return True
        if scope == "any":
            return AnyPermission().has_permission(request, view)
        return AllPermissions().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        required = getattr(view, "permission_required", None) or getattr(view, "permission_required_any", None) or getattr(view, "permission_required_all", None)
        if not required:
            return True
        if request.user and request.user.is_authenticated and request.user.is_superuser:
            return True

        # First try guardian-style object perms if available
        if GUARDIAN_AVAILABLE:
            try:
                for perm in required:
                    # guardian's get_perms returns codenames for the object for the user
                    user_obj_perms = set(get_perms(request.user, obj))
                    # Compare codenames or full "app.codename" if provided
                    # If provided permission is "app.codename", compare by codename part as guardian returns codenames only.
                    perm_codename = perm.split(".", 1)[-1]
                    if perm_codename in user_obj_perms:
                        # If scope is any, permit; if scope is all continue checking
                        if getattr(view, "permission_scope", "all") == "any":
                            return True
                        continue
                    else:
                        # failed this perm
                        if getattr(view, "permission_scope", "all") == "all":
                            break
                else:
                    # loop completed without break => all perms satisfied
                    if getattr(view, "permission_scope", "all") == "all":
                        return True
                # If not satisfied by object perms, fall through to global checks below
            except Exception:
                logger.exception("ObjectOrGlobalPermission guardian check failed")

        # Fallback to global/group/user permissions
        try:
            # Use request.user.has_perm for object-aware backends; many backends accept obj param.
            for perm in required:
                if request.user.has_perm(perm, obj):
                    if getattr(view, "permission_scope", "all") == "any":
                        return True
                    continue
                else:
                    if getattr(view, "permission_scope", "all") == "all":
                        return False
            # If scope == any and none matched, deny; if scope == all and all passed then allowed
            if getattr(view, "permission_scope", "all") == "any":
                return False
            return True
        except Exception:
            logger.exception("ObjectOrGlobalPermission fallback check failed")
            return False