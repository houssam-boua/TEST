# backend/users/management/commands/revoke_permission.py
# Purpose: management command to revoke a global permission from a user.
# Usage: python manage.py revoke_permission <username> <app_label.codename>
from __future__ import annotations

import json

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission

User = get_user_model()


class Command(BaseCommand):
    help = "Revoke a global permission from a user. Usage: revoke_permission <username> <app_label.codename>"

    def add_arguments(self, parser):
        parser.add_argument("username", type=str)
        parser.add_argument("permission", type=str, help="Permission in form app_label.codename")

    def handle(self, *args, **options):
        username = options["username"]
        perm_str = options["permission"]

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"User not found: {username}")

        if "." not in perm_str:
            raise CommandError("Permission must be in form app_label.codename")

        app_label, codename = perm_str.split(".", 1)
        try:
            perm = Permission.objects.get(content_type__app_label=app_label, codename=codename)
        except Permission.DoesNotExist:
            raise CommandError(f"Permission not found: {perm_str}")

        user.user_permissions.remove(perm)
        if hasattr(user, "_effective_permissions_cache"):
            user._effective_permissions_cache = None

        out = {"result": "ok", "username": username, "revoked_permission": perm_str}
        self.stdout.write(json.dumps(out, indent=2))