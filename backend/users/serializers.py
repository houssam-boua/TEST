from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User, UserActionLog, Role, Departement, Site
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import Group, Permission

User = get_user_model()

# --- 1. PRE-DEFINED SERIALIZERS (Must be above UserSerializer) ---

# ✅ NEW: Site Serializer
class SiteSerializer(serializers.ModelSerializer):
    """Serializer for the Site model."""
    class Meta:
        model = Site
        fields = ['id', 'name', 'location']
    
    def validate_name(self, value):
        """Ensure site name is unique (case-insensitive)."""
        if Site.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(f"A site with the name '{value}' already exists.")
        return value

class RoleSerializer(serializers.ModelSerializer):
    """Serializer for the custom Role model."""
    class Meta:
        model = Role
        fields = "__all__"

class DepartementSerializer(serializers.ModelSerializer):
    """
    Serializer for the custom Departement model.
    Supports reading nested site details and writing via site_id.
    """
    # Read: Full site object
    site_details = SiteSerializer(source='site', read_only=True)
    # Write: ID of the site (Required)
    site = serializers.PrimaryKeyRelatedField(queryset=Site.objects.all(), required=True)

    class Meta:
        model = Departement
        fields = ['id', 'dep_name', 'dep_color', 'site', 'site_details', 'created_at', 'updated_at']
        # ✅ FIX: Disable default validators so our custom validate() method controls the error message
        validators = []

    def validate(self, data):
        """
        Check that the department name is unique within the selected site.
        """
        # Get values from data or instance (if updating)
        dep_name = data.get('dep_name') or (self.instance.dep_name if self.instance else None)
        site = data.get('site') or (self.instance.site if self.instance else None)

        if dep_name and site:
            # Case-insensitive check for uniqueness
            qs = Departement.objects.filter(dep_name__iexact=dep_name, site=site)
            
            # Exclude current instance if updating
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                # ✅ Specific Error Key: "dep_name" matches frontend expectation
                raise serializers.ValidationError({
                    "dep_name": f"The department '{dep_name}' already exists in site '{site.name}'."
                })

        return data

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
    """Serializer for Django Auth Groups with permission codename support."""
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
        unknown = []
        perms = []
        for codename in value:
            try:
                perms.append(Permission.objects.get(codename=codename))
            except Permission.DoesNotExist:
                unknown.append(codename)
        if unknown:
            raise serializers.ValidationError({"permissions": f"Unknown codenames: {unknown}"})
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


# --- 2. MAIN USER SERIALIZER ---

class UserSerializer(serializers.ModelSerializer):
    """
    Main User serializer with support for both CREATE and UPDATE operations.
    - Accepts IDs for role/departement/groups from frontend
    - Returns full nested objects in responses
    - Handles password updates securely
    """
    # WRITE interface: Accepts IDs from the frontend
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        required=False  # ✅ Not required for PATCH updates
    )
    departement = serializers.PrimaryKeyRelatedField(
        queryset=Departement.objects.all(),
        required=False  # ✅ Not required for PATCH updates
    )
    groups = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'password', 'role', 'departement', 'groups', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'role': {'required': False},
            'departement': {'required': False},
        }

    def validate(self, data):
        """
        Validation that differentiates between CREATE and UPDATE operations.
        - CREATE: role and departement are required
        - UPDATE: role and departement are optional
        """
        # Check if this is a create operation (no instance exists yet)
        is_create = self.instance is None
        
        if is_create:
            # For CREATE: role and departement are mandatory
            if not data.get("role"):
                raise serializers.ValidationError({"role": "This field is required for new users."})
            if not data.get("departement"):
                raise serializers.ValidationError({"departement": "This field is required for new users."})
        
        return data

    def create(self, validated_data):
        """
        Create a new user with proper password hashing.
        """
        password = validated_data.pop("password", None)
        role = validated_data.pop("role")
        departement = validated_data.pop("departement")
        groups = validated_data.pop("groups", [])
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
        user.groups.set(groups)
        return user

    def update(self, instance, validated_data):
        """
        Update existing user with partial data support (PATCH).
        - Only updates fields that are provided
        - Handles password hashing if password is included
        - Preserves existing role/departement if not provided
        """
        password = validated_data.pop('password', None)
        role = validated_data.pop('role', None)
        departement = validated_data.pop('departement', None)
        groups = validated_data.pop('groups', None)
        
        # Update basic fields (username, email, first_name, last_name, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password only if provided (will be hashed)
        if password:
            instance.set_password(password)
        
        # Update role if provided
        if role is not None:
            instance.role = role
        
        # Update departement if provided
        if departement is not None:
            instance.departement = departement
        
        instance.save()
        
        # Update groups if provided
        if groups is not None:
            instance.groups.set(groups)
        
        return instance

    def to_representation(self, instance):
        """
        Custom representation to return full nested objects for Role/Dept to the frontend
        while maintaining ID-based writes.
        """
        response = super().to_representation(instance)
        
        # --- ROBUST ROLE MAPPING ---
        if instance.role_id:
            try:
                # Standard relationship access
                response["role"] = RoleSerializer(instance.role).data
            except (ObjectDoesNotExist, Exception):
                # Manual DB fallback for data integrity issues
                try:
                    r = Role.objects.get(pk=instance.role_id)
                    response["role"] = RoleSerializer(r).data
                except Role.DoesNotExist:
                    response["role"] = None
        else:
            response["role"] = None

        # --- ROBUST DEPARTMENT MAPPING ---
        if instance.departement_id:
            try:
                response["departement"] = DepartementSerializer(instance.departement).data
            except (ObjectDoesNotExist, Exception):
                try:
                    d = Departement.objects.get(pk=instance.departement_id)
                    response["departement"] = DepartementSerializer(d).data
                except Departement.DoesNotExist:
                    response["departement"] = None
        else:
            response["departement"] = None

        # NESTED GROUPS (Read Only)
        try:
            response["groups"] = GroupSerializer(instance.groups.all(), many=True).data
        except Exception:
            response["groups"] = []

        # PERMISSIONS (Read Only)
        try:
            if hasattr(instance, "get_effective_permissions"):
                perms = instance.get_effective_permissions()
            else:
                from .utils import get_effective_permissions
                perms = get_effective_permissions(instance)
            response["permissions"] = sorted(list(perms)) if perms is not None else []
        except Exception:
            response["permissions"] = []

        return response


class UserMiniSerializer(serializers.ModelSerializer):
    """Minimal serializer for quick user identification."""
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']


class UserActionLogSerializer(serializers.ModelSerializer):
    """Serializer for audit logs of user actions."""
    user_info = serializers.SerializerMethodField(read_only=True)
    target = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserActionLog
        fields = [
            'id', 'user', 'user_info', 'action', 'content_type', 'object_id',
            'target', 'timestamp', 'extra_info'
        ]

    def get_user_info(self, obj):
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
        target = getattr(obj, 'target_object', None)
        if target is None:
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
        # Attempt to find a descriptive label
        for attr in ('title', 'name', 'doc_title', 'filename', 'file_name', 'document_title'):
            if hasattr(target, attr):
                try:
                    data[attr] = getattr(target, attr)
                except Exception:
                    data[attr] = None
        return data


class UserGroupAssignSerializer(serializers.Serializer):
    """Simple serializer for adding/removing groups by ID or Name."""
    group_id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=False)

    def validate(self, data):
        if not data.get("group_id") and not data.get("name"):
            raise serializers.ValidationError("Provide group_id or name.")
        return data