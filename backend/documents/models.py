from django.db import models
from users.models import Utilisateur, Departement

class Document(models.Model):
    nom = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_suppression = models.DateTimeField(null=True, blank=True)
    statut = models.CharField(max_length=50)
    taille = models.FloatField()
    format = models.CharField(max_length=20)
    categorie = models.CharField(max_length=50)
    description = models.TextField()
    commentaire = models.TextField(blank=True)
    role_user = models.CharField(max_length=50)
    role_departement = models.CharField(max_length=50)
    
    owner = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)

    def __str__(self):
        return self.nom