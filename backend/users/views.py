from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate

from rest_framework import viewsets, status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission, Group

from django.core.mail import send_mail
from django.conf import settings

from .models import User, Role, Departement
from .serializers import UserSerializer, UserActionLogSerializer, RoleSerializer, DepartementSerializer, PermissionSerializer, GroupSerializer
from .models import UserActionLog

import secrets
import string

def generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def check_username_exists(username):
    return User.objects.filter(username=username).exists()

def send_password_email(first_name, last_name, user_email, username, password):
    site_name = getattr(settings, "SITE_NAME", "SmartDocs Pro")
    frontend_url = getattr(settings, "FRONTEND_URL", None)
    support_email = getattr(settings, "SUPPORT_EMAIL", settings.DEFAULT_FROM_EMAIL)

    subject = f"[{site_name}] Your account has been created — temporary password"

    plain_message = (
        f"Hello {first_name} {last_name},\n\n"
        f"An account has been created for you on {site_name}.\n\n"
        f"Temporary credentials:\n"
        f"  Username: {username}\n"
        f"  Password: {password}\n\n"
        "IMPORTANT: This password is temporary. Please change it immediately after logging in.\n\n"
    )

    if frontend_url:
        change_pw_url = f"{frontend_url.rstrip('/')}/change-password"
        plain_message += f"To change your password, visit: {change_pw_url}\n\n"
    else:
        plain_message += "To change your password, log in and go to your account settings.\n\n"

    plain_message += (
        f"If you did not request this account or need help, contact {support_email}.\n\n"
        f"Best regards,\n{site_name} Team"
    )

    html_message = (
        f"<p>Hello {first_name} {last_name},</p>"
        f"<p>An account has been created for you on <strong>{site_name}</strong>.</p>"
        f"<p><strong>Temporary credentials</strong></p>"
        f"<ul><li><strong>Username:</strong> {username}</li>"
        f"<li><strong>Temporary password:</strong> {password}</li></ul>"
        f"<p><strong>Important:</strong> Change this temporary password immediately after logging in.</p>"
    )

    if frontend_url:
        html_message += (
            f"<p>Change your password here: "
            f"<a href=\"{change_pw_url}\">{change_pw_url}</a></p>"
        )
    else:
        html_message += "<p>Change your password from your account settings after logging in.</p>"

    html_message += (
        f"<p>If you did not request this account or need assistance, contact "
        f"<a href=\"mailto:{support_email}\">{support_email}</a>.</p>"
        f"<p>Best regards,<br/>{site_name} Team</p>"
    )

    sent = send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user_email],
        html_message=html_message,
    )

    if sent:
        print(f"Password email sent to {user_email}")
    else:
        print(f"Failed to send password email to {user_email}")

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing User objects.
    Provides CRUD operations for User model plus group/permission management endpoints.
    Demonstrates action-level permission overrides using `permission_classes_by_action`.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # Optional mapping to override permissions per action
    permission_classes_by_action = {
        "create": [IsAdminUser],
        "destroy": [IsAdminUser],
        "validators": [IsAuthenticated],
        "groups": [IsAdminUser],
        "add_group": [IsAdminUser],
        "remove_group": [IsAdminUser],
        "bulk_groups": [IsAdminUser],
        "permissions": [IsAuthenticated],
    }

    def get_permissions(self):
        """
        Respect permission_classes_by_action when present; fallback to view's default.
        """
        try:
            return [perm() for perm in self.permission_classes_by_action.get(self.action, self.permission_classes)]
        except Exception:
            return [perm() for perm in self.permission_classes]

    def create(self, request, *args, **kwargs):
        request.data["username"] = request.data.get("username", "").replace(" ", "")
        request.data["password"] = generate_password()
        print(f"Generated group for new user: {request.data['groups']}")  # Debug log

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if check_username_exists(serializer.validated_data["username"]):
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        send_password_email(user.first_name, user.last_name, user.email, user.username, request.data["password"])
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create",
            content_type=ContentType.objects.get_for_model(user),
            object_id=user.id,
            extra_info={"username": user.username},
        )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update",
            content_type=ContentType.objects.get_for_model(user),
            object_id=user.id,
            extra_info={"username": user.username},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user_id = instance.id
        username = instance.username
        self.perform_destroy(instance)
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(User),
            object_id=user_id,
            extra_info={"username": username},
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def validators(self, request):
        """
        Return users that have the 'validator' role.
        GET /users/validators/
        """
        users = User.objects.filter(role__role_name__iexact="validator")
        page = self.paginate_queryset(users)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # -----------------------
    # Group management endpoints (admin-only)
    # -----------------------
    @action(detail=True, methods=["get", "post"], url_path="groups", permission_classes=[IsAdminUser])
    def groups(self, request, pk=None):
        """
        GET /api/users/{id}/groups/ -> list groups the user belongs to
        POST /api/users/{id}/groups/ -> assign group by {group_id} or {name}
        """
        user = self.get_object()
        if request.method == "GET":
            groups = user.groups.all()
            serializer = GroupSerializer(groups, many=True)
            return Response({"groups": serializer.data}, status=status.HTTP_200_OK)

        # POST branch: assign group
        from .serializers import UserGroupAssignSerializer

        serializer = UserGroupAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data.get("group_id"):
            try:
                grp = Group.objects.get(id=data["group_id"])
            except Group.DoesNotExist:
                return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # create group if it doesn't exist (idempotent behavior)
            grp, _created = Group.objects.get_or_create(name__iexact=None, defaults={"name": data["name"]}) if False else (None, False)
            # Use case-insensitive lookup then create
            try:
                grp = Group.objects.get(name__iexact=data["name"])
            except Group.DoesNotExist:
                grp = Group.objects.create(name=data["name"])

        user.groups.add(grp)
        user._effective_permissions_cache = None  # clear any cached perms on user instance
        UserActionLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            action="assign_group",
            content_type=ContentType.objects.get_for_model(grp),
            object_id=grp.id,
            extra_info={"assigned_to": user.username},
        )
        return Response({"detail": "group assigned", "group": GroupSerializer(grp).data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["delete"], url_path="groups/(?P<group_id>[^/.]+)", permission_classes=[IsAdminUser])
    def remove_group(self, request, pk=None, group_id=None):
        """
        DELETE /api/users/{id}/groups/{group_id}/
        """
        user = self.get_object()
        try:
            grp = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)
        user.groups.remove(grp)
        user._effective_permissions_cache = None
        UserActionLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            action="remove_group",
            content_type=ContentType.objects.get_for_model(grp),
            object_id=grp.id,
            extra_info={"removed_from": user.username},
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="groups/bulk", permission_classes=[IsAdminUser])
    def bulk_groups(self, request, pk=None):
        """
        POST /api/users/{id}/groups/bulk/  body: { "group_ids": [1,2,3] }
        """
        user = self.get_object()
        group_ids = request.data.get("group_ids", [])
        if not isinstance(group_ids, (list, tuple)):
            return Response({"error": "group_ids must be a list of integers"}, status=status.HTTP_400_BAD_REQUEST)
        groups = list(Group.objects.filter(id__in=group_ids))
        if not groups:
            return Response({"error": "No valid groups found"}, status=status.HTTP_400_BAD_REQUEST)
        user.groups.set(groups)
        user._effective_permissions_cache = None
        UserActionLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            action="bulk_assign_groups",
            content_type=ContentType.objects.get_for_model(Group),
            object_id=0,
            extra_info={"assigned_to": user.username, "group_ids": [g.id for g in groups]},
        )
        return Response({"detail": "groups updated", "groups": GroupSerializer(groups, many=True).data}, status=status.HTTP_200_OK)

    # -----------------------
    # Permissions endpoint
    # -----------------------
    @action(detail=True, methods=["get"], url_path="permissions", permission_classes=[IsAuthenticated])
    def permissions(self, request, pk=None):
        """
        GET /api/users/{id}/permissions/ -> returns effective permissions
        Returns:
          - permissions: list of "app_label.codename" strings
          - permission_objs: list of PermissionSerializer objects for matching permissions
        """
        user = self.get_object()
        # Prefer the user method if available
        if hasattr(user, "get_effective_permissions"):
            perm_strings = user.get_effective_permissions()
        else:
            from users.utils import get_effective_permissions
            perm_strings = get_effective_permissions(user)

        # Build Permission queryset for serializer where possible (efficient lookup)
        perms = []
        for ps in perm_strings:
            if "." in ps:
                app, codename = ps.split(".", 1)
                try:
                    perm = Permission.objects.select_related("content_type").get(content_type__app_label=app, codename=codename)
                    perms.append(perm)
                except Permission.DoesNotExist:
                    continue

        perm_serializer = PermissionSerializer(perms, many=True)
        return Response({"permissions": sorted(list(perm_strings)), "permission_objs": perm_serializer.data}, status=status.HTTP_200_OK)

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["username", "email", "first_name", "last_name"]
    #  GET /users/?username=John
    #  GET /users/?email=John@exemple.com

class UserViewActionLogSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing UserActionLog entries.
    Read-only access to UserActionLog model.
    """
    queryset = UserActionLog.objects.all().order_by('-timestamp')
    serializer_class = UserActionLogSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["user__username", "action", "content_type__model"]
    #  GET /users/logs/?user__username=John
    #  GET /users/logs/?action=create

class RoleViewSet(viewsets.ModelViewSet):
    '''Role viewset for CRUD operations'''
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create",
            content_type=ContentType.objects.get_for_model(role),
            object_id=role.id,
            extra_info={"role_name": role.role_name}
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update",
            content_type=ContentType.objects.get_for_model(role),
            object_id=role.id,
            extra_info={"role_name": role.role_name}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        role_id = instance.id
        role_name = instance.role_name
        self.perform_destroy(instance)
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(Role),
            object_id=role_id,
            extra_info={"role_name": role_name}
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["role_name", "role_color"]
    #  GET /roles/?role_name=John
    #  GET /roles/?role_color=test

class DepartementViewSet(viewsets.ModelViewSet):
    '''Departement viewset for CRUD operations'''
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dep = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create",
            content_type=ContentType.objects.get_for_model(dep),
            object_id=dep.id,
            extra_info={"dep_name": dep.dep_name}
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        dep = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update",
            content_type=ContentType.objects.get_for_model(dep),
            object_id=dep.id,
            extra_info={"dep_name": dep.dep_name}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        dep_id = instance.id
        dep_name = instance.dep_name
        self.perform_destroy(instance)
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(Departement),
            object_id=dep_id,
            extra_info={"dep_name": dep_name}
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["dep_name", "dep_color"]
    #  GET /departements/?dep_name=test
    #  GET /departements/?dep_color=test

class PermissionViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for listing available permissions.
    """ 

    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['get'])
    def list_permissions(self, request):
        permissions = Permission.objects.all().order_by('content_type__app_label', 'codename')
        serializer = PermissionSerializer(permissions, many=True)
        return Response({"permissions": serializer.data}, status=status.HTTP_200_OK)

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]

class LoginView(APIView):
    """
    Accepts POST requests with 'username' and 'password' in the request body.
    Returns the token if authentication is successful.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        
        username = request.data.get("username")
        password = request.data.get("password")

        print(f"Login attempt for username: {username}")  # Debug log

        if not username or not password:
            return Response({
                "error": "Username and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(username=username, password=password)
        print(f"Authentication result for {username}: {'Success' if user else 'Failed'}")  # Debug log

        if user is not None:
            # Get or create the token for this user
            token, created = Token.objects.get_or_create(user=user)
            
            # Serialize the user data
            user_data = UserSerializer(user).data  # Added .data here
            print(f"User data serialized: {user_data}")  # Debug log

            # prefer the utility to compute effective permissions so it's always up-to-date
            try:
                from .utils import get_effective_permissions
                permissions = sorted(list(get_effective_permissions(user)))
            except Exception:
                # fallback to whatever the serializer produced
                permissions = user_data.get("permissions", [])
            return Response({
                "success": True,
                "message": "User authenticated successfully",
                "token": token.key,
                "data": user_data,
                # "permissions": permissions,
            }, status=status.HTTP_200_OK)
        else:
            print(f"Authentication failed for username: {username}")  # Debug log
            return Response({
                "error": "Invalid credentials"
            }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """
    Accepts POST requests from an authenticated user and deletes their token.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Delete the token to log the user out
        try:
            request.user.auth_token.delete()
            return Response({
                    "message": "Successfully logged out."
                }, status=status.HTTP_200_OK
            )
        except Exception:
            return Response({
                    "error": "Something went wrong during logout."
                }, status=status.HTTP_400_BAD_REQUEST,
            )
