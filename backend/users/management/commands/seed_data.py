# your_app/management/commands/seed_data.py
from django.core.management.base import BaseCommand
from faker import Faker
import random

from users.models import Departement, Role, User  # Adjust the import to your app structure

class Command(BaseCommand):
    help = "Seed the database with fake data for Departement, Role, and User models."

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Create fake Departements
        self.stdout.write("Creating fake Departements...")
        departements = []
        for _ in range(10):
            dep = Departement.objects.create(
                dep_name=fake.word().capitalize(),
                dep_type=fake.word().capitalize()
            )
            departements.append(dep)
        self.stdout.write(self.style.SUCCESS("Successfully created Departements."))

        # Create fake Roles
        self.stdout.write("Creating fake Roles...")
        roles = []
        for _ in range(5):
            role = Role.objects.create(
                role_name=fake.job(),
                role_type=fake.catch_phrase()
            )
            roles.append(role)
        self.stdout.write(self.style.SUCCESS("Successfully created Roles."))

        # Create fake Users
        self.stdout.write("Creating fake Users...")
        for _ in range(20):
            # Pick a random departement and role
            dep = random.choice(departements)
            role = random.choice(roles)
            username = fake.user_name()
            email = fake.email()
            # Create the user using the built-in create_user method which hashes the password.
            user = User.objects.create_user(
                username=username,
                email=email,
                password="password123",  # Use a default password or generate one with fake.password()
                role=role,
                departement=dep
            )
            self.stdout.write(self.style.SUCCESS(f"Created user {username}"))
        self.stdout.write(self.style.SUCCESS("Database seeding completed."))
