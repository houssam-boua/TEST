from django.contrib import admin
from .models import User, Departement, Role

# Register your models here.
admin.site.register(User)
admin.site.register(Departement)
admin.site.register(Role)