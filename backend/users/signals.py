# backend/users/signals.py
# Purpose: connect signal handlers that audit permission/group changes and permission seeding.
# Writes PermissionAudit entries for group membership and permission assignments.
from __future__ import annotations

import json
import logging
from typing import Optional

from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
from django.db import connections
from django.db.utils import OperationalError, ProgrammingError
 
# PermissionAudit is optional (migration may not have been applied). Import alongside UserActionLog for safe fallback.
from .models import PermissionAudit, UserActionLog
 
logger = logging.getLogger("permissions")
User = get_user_model()
 
 
def _create_audit(actor: Optional[User], action: str, target_obj=None, details: Optional[dict] = None):
    """Robust helper to create PermissionAudit rows; uses transaction.on_commit when possible and falls back to UserActionLog.
    Defensive: if the DB connection is in an aborted transaction, we skip DB writes to avoid 'current transaction is aborted' errors.
    This function is best-effort and will never raise; exceptions are logged.
    """
    try:
        # Avoid attempting DB writes if connection is in an aborted transaction
        try:
            from django.db import connection as _connection
            if getattr(_connection, "needs_rollback", False):
                logger.warning(
                    "Database connection in aborted transaction; skipping audit write for action=%s target=%s",
                    action,
                    repr(target_obj),
                )
                return
        except Exception:
            # If we cannot inspect connection state, continue but guard DB writes below.
            pass

        ct = None
        obj_id = None
        if target_obj is not None:
            try:
                ct = ContentType.objects.get_for_model(target_obj)
                obj_id = getattr(target_obj, "pk", None) or getattr(target_obj, "id", None)
            except Exception:
                ct = None
                obj_id = None

        from django.db import transaction

        def _do_write():
            """Attempt to write PermissionAudit, fall back to UserActionLog on failure."""
            try:
                # Try PermissionAudit first
                PermissionAudit.objects.create(
                    actor=actor if getattr(actor, "is_authenticated", False) else None,
                    target_content_type=ct,
                    target_object_id=obj_id,
                    action=action,
                    details=details or {},
                )
                return
            except Exception as e:
                logger.debug("PermissionAudit write failed (%s); attempting fallback to UserActionLog", e)
            try:
                UserActionLog.objects.create(
                    user=actor if getattr(actor, "is_authenticated", False) else None,
                    action=action,
                    content_type=ct,
                    object_id=obj_id or 0,
                    extra_info=details or {},
                )
            except Exception:
                logger.exception("Failed to write fallback UserActionLog for action=%s target=%s", action, repr(target_obj))

        # If inside an atomic block, schedule the write after commit to avoid interfering with the current transaction.
        try:
            if transaction.get_connection().in_atomic_block:
                transaction.on_commit(_do_write)
            else:
                # Not in transaction: perform immediately but guard with try/except inside _do_write
                _do_write()
        except Exception:
            # As a safeguard, attempt immediate write (already guarded) and finally ensure no exception escapes.
            try:
                _do_write()
            except Exception:
                logger.exception("Unexpected failure while attempting audit write for action=%s target=%s", action, repr(target_obj))
    except Exception:
        logger.exception("Unexpected error in _create_audit for action=%s target=%s", action, repr(target_obj))


# Audit user <-> group membership changes
@receiver(m2m_changed, sender=User.groups.through)
def user_groups_changed(sender, instance, action, pk_set, **kwargs):
    """
    Record when users are added to or removed from groups.
    """
    if action not in ("post_add", "post_remove", "post_clear"):
        return

    actor = None  # We don't have request context in signals; leave actor null.
    if action == "post_add":
        for gid in pk_set or []:
            try:
                grp = Group.objects.get(pk=gid)
                _create_audit(actor, "user_added_to_group", target_obj=grp, details={"user_id": instance.pk, "group_id": gid, "group_name": grp.name})
            except Exception:
                logger.exception("user_groups_changed post_add failed for gid=%s user=%s", gid, instance.pk)
    elif action == "post_remove":
        for gid in pk_set or []:
            try:
                grp = Group.objects.get(pk=gid)
                _create_audit(actor, "user_removed_from_group", target_obj=grp, details={"user_id": instance.pk, "group_id": gid, "group_name": grp.name})
            except Exception:
                logger.exception("user_groups_changed post_remove failed for gid=%s user=%s", gid, instance.pk)
    elif action == "post_clear":
        _create_audit(actor, "user_cleared_groups", target_obj=instance, details={"user_id": instance.pk})


# Audit group <-> permission changes
@receiver(m2m_changed, sender=Group.permissions.through)
def group_permissions_changed(sender, instance, action, pk_set, **kwargs):
    """
    Record when permissions are assigned to or removed from groups.
    """
    if action not in ("post_add", "post_remove", "post_clear"):
        return

    actor = None
    if action == "post_add":
        for pid in pk_set or []:
            try:
                perm = Permission.objects.get(pk=pid)
                _create_audit(actor, "permission_added_to_group", target_obj=instance, details={"permission": f"{perm.content_type.app_label}.{perm.codename}", "permission_id": pid})
            except Exception:
                logger.exception("group_permissions_changed post_add failed for pid=%s group=%s", pid, instance.pk)
    elif action == "post_remove":
        for pid in pk_set or []:
            try:
                perm = Permission.objects.get(pk=pid)
                _create_audit(actor, "permission_removed_from_group", target_obj=instance, details={"permission": f"{perm.content_type.app_label}.{perm.codename}", "permission_id": pid})
            except Exception:
                logger.exception("group_permissions_changed post_remove failed for pid=%s group=%s", pid, instance.pk)
    elif action == "post_clear":
        _create_audit(actor, "group_permissions_cleared", target_obj=instance)


# Audit when Group or Permission objects are created/updated (useful for seeding)
@receiver(post_save, sender=Group)
def group_post_save(sender, instance, created, **kwargs):
    action = "group_created" if created else "group_updated"
    _create_audit(None, action, target_obj=instance, details={"group_name": instance.name, "group_id": instance.pk})


@receiver(post_save, sender=Permission)
def permission_post_save(sender, instance, created, **kwargs):
    action = "permission_created" if created else "permission_updated"
    try:
        perm_str = f"{instance.content_type.app_label}.{instance.codename}"
    except Exception:
        perm_str = getattr(instance, "codename", None)
    _create_audit(None, action, target_obj=instance, details={"permission": perm_str, "permission_id": instance.pk})