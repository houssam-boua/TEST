from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User, UserActionLog, Role, Departement

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(queryset=Role.objects.all(), slug_field='id')
    departement = serializers.SlugRelatedField(queryset=Departement.objects.all(), slug_field='id')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'departement']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if not data.get("role"):
            raise serializers.ValidationError({"role": "This field is required."})
        if not data.get("departement"):
            raise serializers.ValidationError({"departement": "This field is required."})
        return data

    def create(self, validated_data):
        # Extract password and required foreign keys explicitly to ensure DB NOT NULL constraints are satisfied
        password = validated_data.pop("password", None)
        role = validated_data.pop("role")
        departement = validated_data.pop("departement")
        # Remove username/email from validated_data to avoid passing them twice
        username = validated_data.pop("username", None)
        email = validated_data.pop("email", None)
    
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            departement=departement,
            **validated_data
        )
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
