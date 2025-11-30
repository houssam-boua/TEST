# backend/users/management/commands/seed_permissions.py
# Purpose: create standard groups (Admin/Editor/Viewer/Manager) and assign permissions idempotently.
# Note: This command is safe to run multiple times.
from __future__ import annotations

import json
from typing import List

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


GROUPS_PERMISSIONS = {
    "Admin": ["auth.add_user", "auth.change_user", "auth.delete_user", "auth.view_user"],
    "Editor": ["documents.add_document", "documents.change_document", "documents.view_document"],
    "Viewer": ["documents.view_document"],
    "Manager": ["documents.view_document", "workflows.change_task", "workflows.view_task"],
}


class Command(BaseCommand):
    help = "Seed standard permission groups (Admin/Editor/Viewer/Manager) and assign permissions."

    def handle(self, *args, **options):
        created = []
        updated = []
        for group_name, perms in GROUPS_PERMISSIONS.items():
            group, gcreated = Group.objects.get_or_create(name=group_name)
            if gcreated:
                created.append(group_name)
            # resolve permission strings to Permission objects
            perm_objs = []
            for pstr in perms:
                if "." not in pstr:
                    self.stderr.write(f"Skipping invalid permission format: {pstr}")
                    continue
                app_label, codename = pstr.split(".", 1)
                try:
                    perm = Permission.objects.get(content_type__app_label=app_label, codename=codename)
                    perm_objs.append(perm)
                except Permission.DoesNotExist:
                    self.stderr.write(f"Permission not found: {pstr}")
            if perm_objs:
                # idempotent add
                group.permissions.add(*perm_objs)
                updated.append(group_name)
        self.stdout.write(self.style.SUCCESS(f"Seed completed. Created groups: {created}; updated: {updated}"))
        # Print current groups and permissions as JSON for visibility
        out = {}
        for g in Group.objects.filter(name__in=list(GROUPS_PERMISSIONS.keys())):
            out[g.name] = [f"{p.content_type.app_label}.{p.codename}" for p in g.permissions.all()]
        self.stdout.write(json.dumps(out, indent=2))