from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0016_alter_folder_fol_name"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="folder",
            constraint=models.UniqueConstraint(fields=["fol_name", "parent_folder"], name="unique_folder_name_in_parent"),
        ),
    ]
