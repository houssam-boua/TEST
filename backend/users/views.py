from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Role, Departement
from .serializers import UserSerializer, RoleSerializer, DepartementSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing User objects.
    Provides CRUD operations for User model.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["username", "email", "first_name", "last_name"]
    #  GET /users/?username=John
    #  GET /users/?email=John@exemple.com


class RoleViewSet(viewsets.ModelViewSet):
    '''Role viewset for CRUD operations'''
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["role_name", "role_type"]
    #  GET /roles/?role_name=John
    #  GET /roles/?role_type=test


class DepartementViewSet(viewsets.ModelViewSet):
    '''Departement viewset for CRUD operations'''
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["dep_name", "dep_type"]
    #  GET /departements/?dep_name=test
    #  GET /departements/?dep_type=test


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
