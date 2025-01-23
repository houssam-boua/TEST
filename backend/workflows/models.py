from django.db import models

class Workflow(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField()
    etat = models.CharField(max_length=50)
    document = models.ForeignKey('documents.Document', on_delete=models.CASCADE)

class Tache(models.Model):
    PRIORITY_CHOICES = [
        ('urgent', 'Urgent'),
        ('haute', 'Haute'),
        ('normale', 'Normale'),
        ('basse', 'Basse'),
    ]
    STATUS_CHOICES = [
        ('non_commencee', 'Non commencée'),
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
    ]
    nom = models.CharField(max_length=100)
    date_echeance = models.DateTimeField()
    priorite = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey('users.User', on_delete=models.CASCADE)