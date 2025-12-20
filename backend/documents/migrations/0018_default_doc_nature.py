from django.db import migrations

def create_default_natures(apps, schema_editor):
    DocumentNature = apps.get_model('documents', 'DocumentNature')
    defaults = [
        {"code": "IT", "name": "Instruction de travail", "description": "Instruction de travail"},
        {"code": "ET", "name": "Enregistrement", "description": "Enregistrement"},
        {"code": "FI", "name": "Fiche", "description": "Fiche"},
    ]
    for entry in defaults:
        DocumentNature.objects.get_or_create(code=entry["code"], defaults=entry)

class Migration(migrations.Migration):
    dependencies = [
        ("documents", "0017_folder_unique_name_in_parent"),
    ]
    operations = [
        migrations.RunPython(create_default_natures),
    ]
