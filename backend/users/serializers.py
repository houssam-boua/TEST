from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User, UserActionLog, Role, Departement

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(read_only=True, slug_field='role_name')
    departement = serializers.SlugRelatedField(read_only=True, slug_field='dep_name')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'departement']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActionLog
        fields = "__all__"

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"

class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = "__all__"
