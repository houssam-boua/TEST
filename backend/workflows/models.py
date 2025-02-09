from django.db import models


class Workflow(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField()
    etat = models.CharField(max_length=50)
    document = models.ForeignKey("documents.Document", on_delete=models.CASCADE)


class Task(models.Model):
    PRIORITY_CHOICES = [
        ("urgent", "Urgent"),
        ("high", "High"),
        ("normal", "Normal"),
        ("low", "Low"),
    ]

    STATUS_CHOICES = [
        ("not_started", "Not started"),
        ("in_progress", "In progress"),
        ("completed", "Completed"),
    ]

    task_name = models.CharField(max_length=100)
    task_date_echeance = models.DateTimeField()
    task_priorite = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    task_statut = models.CharField(max_length=20, choices=STATUS_CHOICES)

    task_workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    task_assigned_to = models.ForeignKey("users.User", on_delete=models.CASCADE)
