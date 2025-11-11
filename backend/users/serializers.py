from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User, UserActionLog, Role, Departement

# for permission handling
from django.contrib.auth.models import Group, Permission

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
    user_info = serializers.SerializerMethodField(read_only=True)
    target = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserActionLog
        # include all model fields plus computed 'user_info' and 'target'
        fields = [
            'id', 'user', 'user_info', 'action', 'content_type', 'object_id',
            'target', 'timestamp', 'extra_info'
        ]

    def get_user_info(self, obj):
        """Return a minimal user summary for the actor (id, username, names, role)."""
        user = getattr(obj, 'user', None)
        if not user:
            return None
        return {
            'id': user.id,
            'username': getattr(user, 'username', None),
            'first_name': getattr(user, 'first_name', None),
            'last_name': getattr(user, 'last_name', None),
            'role': getattr(getattr(user, 'role', None), 'role_name', None),
        }

    def get_target(self, obj):
        """Return a small representation of the target object (id, model, repr and common attrs).

        This uses the GenericForeignKey (target_object) if available and will try to
        surface handy attributes such as title/name/doc_title/filename when present.
        """
        target = getattr(obj, 'target_object', None)
        if target is None:
            # If GenericForeignKey didn't resolve, at least return type/id
            return {
                'id': obj.object_id,
                'model': getattr(obj.content_type, 'model', None),
                'repr': None,
            }
        data = {
            'id': getattr(target, 'id', obj.object_id),
            'model': getattr(obj.content_type, 'model', None),
            'repr': str(target),
        }

        # try to include some common descriptive fields if present
        for attr in ('title', 'name', 'doc_title', 'filename', 'file_name', 'document_title'):
            if hasattr(target, attr):
                try:
                    data[attr] = getattr(target, attr)
                except Exception:
                    data[attr] = None

        return data

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"

class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = "__all__"

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"

class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.ListField(
        child = serializers.CharField(),
        write_only = True,
        required = False,
        help_text = "List of permission codenames"
    )
    
    class Meta:
        model = Group
        fields = ["id", "name", "permissions"]

    def validate_permissions(self, value):
        unkown = []
        perms = []

        for codename in value:
            try:
                perms.append(Permission.objects.get(codename = codename))

            except Permission.DoesNotExist: 
                unkown.append(codename)

        if unkown:
            raise serializers.ValidationError({"permissions": f"Unkown codenames: {unkown}"})

        return perms
    
    def create(self, validated_data):
        permissions = validated_data.pop("permissions", [])
        group = Group.objects.create(**validated_data)
        if permissions:
            group.permissions.set(permissions)
        return group
    
    def update(self, instance, validated_data):
        permissions = validated_data.pop("permissions", None)
        instance.name = validated_data.get("name", instance.name)
        instance.save()

        if permissions is not None:
            instance.permissions.set(permissions)
        return instance
