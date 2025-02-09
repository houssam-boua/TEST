from django.contrib.auth import get_user_model  # Get the user model dynamically
from rest_framework import serializers
from .models import User, Role, Departement

User = get_user_model()  # Ensures compatibility with custom User models

class UserSerializer(serializers.ModelSerializer):
    '''User serializer for serializing user data'''
    role = serializers.SlugRelatedField(read_only=True, slug_field='role_name')
    departement = serializers.SlugRelatedField(read_only=True, slug_field='dep_name')

    class Meta:
        model = User
        fields = "__all__"

class RoleSerializer(serializers.ModelSerializer):
    '''Role serializer for serializing role data'''
    class Meta:
        model = Role
        fields = "__all__"

class DepartementSerializer(serializers.ModelSerializer):
    '''Departement serializer for serializing departement data'''
    class Meta:
        model = Departement
        fields = "__all__"
