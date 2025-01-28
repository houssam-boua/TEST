from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from .models import User, Role, Departement
from .serializers import UserSerializer, RoleSerializer, DepartementSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['username', 'email', 'first_name', 'last_name']
    #  GET /users/?username=John 
    #  GET /users/?email=John@exemple.com

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role_name', 'role_type']
    #  GET /roles/?role_name=John 
    #  GET /roles/?role_type=test


class DepartementViewSet(viewsets.ModelViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dep_name', 'dep_type']
    #  GET /departements/?dep_name=test 
    #  GET /departements/?dep_type=test
