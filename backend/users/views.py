from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import User, Role, Departement
from .serializers import UserSerializer, UserActionLogSerializer, RoleSerializer, DepartementSerializer
from django.contrib.contenttypes.models import ContentType
from .models import UserActionLog

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing User objects.
    Provides CRUD operations for User model.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, serializer):
        user = serializer.save()
        UserActionLog.objects.create(
            user=user,
            action="create",
            content_type=ContentType.objects.get_for_model(user),
            object_id=user.id,
            extra_info={"username": user.username}
        )

    def update(self, serializer):
        user = serializer.save()
        UserActionLog.objects.create(
            user=user,
            action="update",
            content_type=ContentType.objects.get_for_model(user),
            object_id=user.id,
            extra_info={"username": user.username}
        )

    def delete(self, instance):
        user_id = instance.id
        username = instance.username
        instance.delete()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(User),
            object_id=user_id,
            extra_info={"username": username}
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def validators(self, request):
        """
        Return users that have the 'validator' role.
        GET /users/validators/
        """
        users = User.objects.filter(role__role_name__iexact='validator')
        page = self.paginate_queryset(users)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(users,  many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
    #  GET /useractionlogs/?user__username=John
    #  GET /useractionlogs/?action=create

class RoleViewSet(viewsets.ModelViewSet):
    '''Role viewset for CRUD operations'''
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    def create(self, serializer):
        role = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create",
            content_type=ContentType.objects.get_for_model(role),
            object_id=role.id,
            extra_info={"role_name": role.role_name}
        )

    def update(self, serializer):
        role = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update",
            content_type=ContentType.objects.get_for_model(role),
            object_id=role.id,
            extra_info={"role_name": role.role_name}
        )

    def delete(self, instance):
        role_id = instance.id
        role_name = instance.role_name
        instance.delete()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(Role),
            object_id=role_id,
            extra_info={"role_name": role_name}
        )

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["role_name", "role_color"]
    #  GET /roles/?role_name=John
    #  GET /roles/?role_color=test


class DepartementViewSet(viewsets.ModelViewSet):
    '''Departement viewset for CRUD operations'''
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer

    def create(self, serializer):
        dep = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create",
            content_type=ContentType.objects.get_for_model(dep),
            object_id=dep.id,
            extra_info={"dep_name": dep.dep_name}
        )

    def update(self, serializer):
        dep = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update",
            content_type=ContentType.objects.get_for_model(dep),
            object_id=dep.id,
            extra_info={"dep_name": dep.dep_name}
        )

    def delete(self, instance):
        dep_id = instance.id
        dep_name = instance.dep_name
        instance.delete()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(Departement),
            object_id=dep_id,
            extra_info={"dep_name": dep_name}
        )

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["dep_name", "dep_color"]
    #  GET /departements/?dep_name=test
    #  GET /departements/?dep_color=test


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

            return Response({
                "success": True,
                "message": "User authenticated successfully",
                "token": token.key,
                "data": user_data,
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
