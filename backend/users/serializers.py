from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User, UserActionLog, Role, Departement

# for permission handling
from django.contrib.auth.models import Group, Permission

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # keep accepting IDs on write, but return nested objects on read
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    departement = serializers.PrimaryKeyRelatedField(queryset=Departement.objects.all())
    # allow assigning groups via API (list of group PKs)
    groups = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), many=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'departement', 'groups']
        extra_kwargs = {'password': {'write_only': True, "required": False}}
 
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
        # pop groups if present (PrimaryKeyRelatedField returns Group instances)
        groups = validated_data.pop("groups", [])
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
        # assign any provided groups after user creation
        user.groups.set(groups)
        return user

    def to_representation(self, instance):
        """
        Return nested representations for role, departement, groups and effective permissions
        while keeping write interface as IDs (clients still POST/PUT with role/departement/group IDs).
        """
        data = super().to_representation(instance)
        try:
            data["role"] = RoleSerializer(instance.role).data if getattr(instance, "role", None) else None
        except Exception:
            data["role"] = None
        try:
            data["departement"] = (
                DepartementSerializer(instance.departement).data if getattr(instance, "departement", None) else None
            )
        except Exception:
            data["departement"] = None

        # Provide a read-only nested groups representation for convenience
        try:
            data["groups"] = GroupSerializer(instance.groups.all(), many=True).data
        except Exception:
            data["groups"] = []

        # Effective permissions (read-only): prefer model helper, fall back to utils
        try:
            if hasattr(instance, "get_effective_permissions"):
                perms = instance.get_effective_permissions()
            else:
                from .utils import get_effective_permissions
                perms = get_effective_permissions(instance)
            data["permissions"] = sorted(list(perms)) if perms is not None else []
        except Exception:
            data["permissions"] = []

        return data

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

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
    """
    Serializer exposing permission core fields plus friendly helpers.
    """
    action = serializers.SerializerMethodField(read_only=True)
    target = serializers.SerializerMethodField(read_only=True)
    label = serializers.SerializerMethodField(read_only=True)
    app_label = serializers.SerializerMethodField(read_only=True)
    perm_string = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Permission
        fields = [
            "id",
            "name",
            "codename",
            "content_type",
            "app_label",
            "perm_string",
            "action",
            "target",
            "label",
        ]

    def get_action(self, obj):
        codename = getattr(obj, "codename", "") or ""
        if not codename:
            return ""
        if "_" in codename:
            verb = codename.split("_", 1)[0].lower()
        else:
            verb = codename.lower()
        mapping = {"add": "create", "change": "update", "delete": "delete", "view": "view"}
        return mapping.get(verb, verb)

    def get_target(self, obj):
        ct = getattr(obj, "content_type", None)
        if ct is None:
            return None
        model = getattr(ct, "model", None)
        app = getattr(ct, "app_label", None)
        if app and model:
            return f"{app}.{model}"
        return model

    def get_label(self, obj):
        action = self.get_action(obj) or "perform"
        target = self.get_target(obj) or ""
        return f"can {action} {target}".strip()

    def get_app_label(self, obj):
        ct = getattr(obj, "content_type", None)
        return getattr(ct, "app_label", None) if ct else None

    def get_perm_string(self, obj):
        ct = getattr(obj, "content_type", None)
        if not ct or not getattr(obj, "codename", None):
            return None
        return f"{ct.app_label}.{obj.codename}"


class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="List of permission codenames",
    )

    class Meta:
        model = Group
        fields = ["id", "name", "permissions"]

    def validate_permissions(self, value):
        unkown = []
        perms = []

        for codename in value:
            try:
                perms.append(Permission.objects.get(codename=codename))
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


class UserGroupAssignSerializer(serializers.Serializer):
    """
    Serializer for assigning/removing groups via API.
    Accepts either group_id or name.
    """
    group_id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=False)

    def validate(self, data):
        if not data.get("group_id") and not data.get("name"):
            raise serializers.ValidationError("Provide group_id or name.")
        return data
