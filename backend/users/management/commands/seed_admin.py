import os
from django.core.management.base import BaseCommand
from django.db import IntegrityError

from users.models import Departement, Role, User


class Command(BaseCommand):
    help = "Create one Admin (superuser), one Validator and one regular User."

    def handle(self, *args, **options):
        dep, _ = Departement.objects.get_or_create(
            dep_name="General",
            defaults={"dep_color": "Gray"},
        )

        admin_role, _ = Role.objects.get_or_create(
            role_name="admin", defaults={"role_color": "Black"}
        )
        validator_role, _ = Role.objects.get_or_create(
            role_name="validator", defaults={"role_color": "Orange"}
        )
        user_role, _ = Role.objects.get_or_create(
            role_name="user", defaults={"role_color": "Green"}
        )

        created = []

        # Admin (superuser)
        admin_password = os.environ.get("ADMIN_PASSWORD", "admin")
        if not User.objects.filter(username="admin").exists():
            try:
                User.objects.create_superuser(
                    username="admin",
                    email="admin@example.com",
                    password=admin_password,
                    first_name="Admin",
                    last_name="User",
                    role=admin_role,
                    departement=dep,
                )
            except TypeError:
                # Fallback if custom create_superuser signature differs
                admin = User.objects.create_user(
                    username="admin",
                    email="admin@example.com",
                    password=admin_password,
                    first_name="Admin",
                    last_name="User",
                    role=admin_role,
                    departement=dep,
                )
                admin.is_staff = True
                admin.is_superuser = True
                admin.save()
            created.append("admin")

        # Validator
        if not User.objects.filter(username="validator").exists():
            User.objects.create_user(
                username="validator",
                email="validator@example.com",
                password="validatorpass",
                first_name="Validator",
                last_name="User",
                role=validator_role,
                departement=dep,
            )
            created.append("validator")

        # Regular user
        if not User.objects.filter(username="user").exists():
            User.objects.create_user(
                username="user",
                email="user@example.com",
                password="userpass",
                first_name="Regular",
                last_name="User",
                role=user_role,
                departement=dep,
            )
            created.append("user")

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created: {', '.join(created)}"))
        else:
            self.stdout.write(self.style.WARNING("Admin, validator and user already exist."))