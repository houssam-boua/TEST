# your_app/management/commands/seed_data.py
from django.core.management.base import BaseCommand
from faker import Faker
import random

from users.models import (
    Departement,
    Role,
    User,
)
from documents.models import Document
from workflows.models import Workflow


class Command(BaseCommand):
    help = "Seed the database with fake data for Departement, Role, User, Document, and Workflow models."

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Create fake Departements
        self.stdout.write("Creating fake Departements...")
        departements = []
        for _ in range(10):
            dep = Departement.objects.create(
                dep_name=fake.word().capitalize(), dep_color=fake.word().capitalize()
            )
            departements.append(dep)
        self.stdout.write(self.style.SUCCESS("Successfully created Departements."))

        # Create fake Roles
        self.stdout.write("Creating fake Roles...")
        roles = []
        role_names = ["admin", "validator", "user"]
        for name in role_names:
            role = Role.objects.create(
            role_name=name, role_color=fake.catch_phrase()
            )
            roles.append(role)
        self.stdout.write(self.style.SUCCESS("Successfully created Roles."))

        # Create fake Users
        self.stdout.write("Creating fake Users...")
        users = []
        for _ in range(10):
            # Pick a random departement and role
            dep = random.choice(departements)
            role = random.choice(roles)
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = fake.user_name()
            email = fake.email()

            user = User.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                username=username,
                email=email,
                password="password123", 
                role=role,
                departement=dep,
            )
            users.append(user)
            self.stdout.write(self.style.SUCCESS(f"Created user {username}"))
        self.stdout.write(self.style.SUCCESS("Successfully created Users."))

        # Create fake Documents
        self.stdout.write("Creating fake Documents...")
        documents = []
        for _ in range(10):
            doc = Document.objects.create(
                doc_title=fake.sentence(nb_words=3),
                doc_type=random.choice(["PDF", "Word", "Excel"]),
                doc_status=random.choice(["Active", "Inactive"]),
                doc_size=random.randint(100, 5000),
                doc_format=random.choice(["pdf", "docx", "xlsx"]),
                doc_category=fake.word().capitalize(),
                doc_description=fake.text(max_nb_chars=200),
                doc_owner=random.choice(users),
                doc_departement=random.choice(departements),
            )
            documents.append(doc)
        self.stdout.write(self.style.SUCCESS("Successfully created Documents."))

        self.stdout.write(self.style.SUCCESS("Database seeding completed."))
