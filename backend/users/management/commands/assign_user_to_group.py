# backend/users/management/commands/assign_user_to_group.py
# Purpose: management command to assign a user to a group.
# Usage: python manage.py assign_user_to_group <username> <group_name>
from __future__ import annotations

import json
from typing import Optional

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()


class Command(BaseCommand):
    help = "Assign a user to a group. Usage: assign_user_to_group <username> <group_name>"

    def add_arguments(self, parser):
        parser.add_argument("username", type=str)
        parser.add_argument("group_name", type=str)

    def handle(self, *args, **options):
        username = options["username"]
        group_name = options["group_name"]

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"User not found: {username}")

        try:
            group = Group.objects.get(name__iexact=group_name)
        except Group.DoesNotExist:
            raise CommandError(f"Group not found: {group_name}")

        user.groups.add(group)
        # clear cached perms if present
        if hasattr(user, "_effective_permissions_cache"):
            user._effective_permissions_cache = None

        out = {"result": "ok", "username": username, "group": group.name, "group_id": group.id}
        self.stdout.write(json.dumps(out, indent=2))