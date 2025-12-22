from django.core.management.base import BaseCommand
from documents.models import DocumentCategory, DocumentNature
from django.db import transaction

class Command(BaseCommand):
    help = 'Seeds document categories and natures for ISMS document control system'

    def handle(self, *args, **options):
        categories = [
            {'code': 'RH', 'name': 'Ressources Humaines', 'description': 'Documents related to human resources management'},
            {'code': 'MT', 'name': 'Maintenance', 'description': 'Documents related to maintenance processes'},
            {'code': 'AC', 'name': 'Achat', 'description': 'Documents related to procurement and purchasing'},
            {'code': 'GD', 'name': 'Gestion documentaire', 'description': 'Documents related to document management'},
        ]
        natures = [
            {'code': 'PR', 'name': 'Procédure', 'description': 'Procedure documents'},
            {'code': 'PS', 'name': 'Processus', 'description': 'Process documents'},
            {'code': 'IT', 'name': 'Instruction de travail', 'description': 'Work instruction documents'},
            {'code': 'EQ', 'name': 'Enregistrement', 'description': 'Record/registration documents'},
            {'code': 'FI', 'name': 'Fiche', 'description': 'Form/sheet documents'},
        ]

        created_cat, updated_cat = 0, 0
        created_nat, updated_nat = 0, 0

        try:
            with transaction.atomic():
                for cat in categories:
                    obj, created = DocumentCategory.objects.update_or_create(
                        code=cat['code'],
                        defaults={'name': cat['name'], 'description': cat['description']}
                    )
                    if created:
                        created_cat += 1
                        self.stdout.write(self.style.SUCCESS(f"Created category: {obj.code} - {obj.name}"))
                    else:
                        updated_cat += 1
                        self.stdout.write(self.style.WARNING(f"Updated category: {obj.code} - {obj.name}"))

                for nat in natures:
                    obj, created = DocumentNature.objects.update_or_create(
                        code=nat['code'],
                        defaults={'name': nat['name'], 'description': nat['description']}
                    )
                    if created:
                        created_nat += 1
                        self.stdout.write(self.style.SUCCESS(f"Created nature: {obj.code} - {obj.name}"))
                    else:
                        updated_nat += 1
                        self.stdout.write(self.style.WARNING(f"Updated nature: {obj.code} - {obj.name}"))

            self.stdout.write(self.style.SUCCESS(
                f"Seeding complete: {created_cat} categories created, {updated_cat} updated; "
                f"{created_nat} natures created, {updated_nat} updated."
            ))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error during seeding: {e}"))