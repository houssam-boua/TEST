from rest_framework import serializers
from .models import User, Role, Departement


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"


class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = "__all__"
