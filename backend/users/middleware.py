# backend/users/middleware.py
# Purpose: attach per-request cached permissions and basic permission-check auditing helper.
# This middleware computes the effective permissions once per request and exposes:
#   - request.user_permissions (set of "app_label.codename")
#   - request.log_permission_check(actor, perm, granted, obj=None, details=None)
# The audit function writes a PermissionAudit entry when available.
from __future__ import annotations

from typing import Optional, Set, Callable, Any
import logging

from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType

from .utils import get_effective_permissions
from .models import PermissionAudit

User = get_user_model()
logger = logging.getLogger("permissions")


class PermissionMiddleware(MiddlewareMixin):
    """
    Compute and attach effective permissions for the authenticated user to the request
    to avoid repeated DB hits during a request lifecycle.

    Also provides a helper `request.log_permission_check(...)` that view code or permission
    classes can call to write lightweight audit entries.
    """

    def process_request(self, request):
        request.user_permissions: Set[str] = set()
        request._permission_audit_logger: Callable[..., Any] = lambda *args, **kwargs: None

        user = getattr(request, "user", None)
        if user and getattr(user, "is_authenticated", False):
            try:
                request.user_permissions = get_effective_permissions(user)
            except Exception:
                logger.exception("Failed to compute effective permissions for user=%s", getattr(user, "pk", None))
                request.user_permissions = set()

            # attach an audit helper that writes PermissionAudit rows (best-effort)
            def _log_permission_check(actor: Optional[User], perm: str, granted: bool, obj: Optional[object] = None, details: Optional[dict] = None):
                try:
                    content_type = None
                    object_id = None
                    if obj is not None:
                        try:
                            ct = ContentType.objects.get_for_model(obj)
                            content_type = ct
                            object_id = getattr(obj, "pk", None) or getattr(obj, "id", None)
                        except Exception:
                            # ignore content type resolution errors
                            content_type = None
                            object_id = None

                    PermissionAudit.objects.create(
                        actor=actor if getattr(actor, "is_authenticated", False) else None,
                        target_content_type=content_type,
                        target_object_id=object_id,
                        action=("granted" if granted else "denied"),
                        details={"perm": perm, **(details or {})},
                    )
                except Exception:
                    logger.exception("Failed to write permission audit for perm=%s actor=%s", perm, getattr(actor, "pk", None))

            request.log_permission_check = _log_permission_check  # type: ignore[attr-defined]
        else:
            # anonymous or no user: leave empty set and dummy logger
            request.user_permissions = set()
            request.log_permission_check = lambda *args, **kwargs: None  # type: ignore[assignment]