import django_filters
from .models import User, Role, Departement

class UserFilter(django_filters.FilterSet):
    username = django_filters.CharFilter(method='validate_username')
    email = django_filters.CharFilter(method='validate_email')
    first_name = django_filters.CharFilter(method='validate_first_name')
    last_name = django_filters.CharFilter(method='validate_last_name')

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

    def validate_username(self, queryset, name, value):
        # Add your custom validation logic for username here
        if not value.isalpha():
            raise django_filters.exceptions.ValidationError("Username must contain only letters.")
        return queryset.filter(username=value)

    def validate_email(self, queryset, name, value):
        # Add your custom validation logic for email here
        if "@" not in value:
            raise django_filters.exceptions.ValidationError("Invalid email format.")
        return queryset.filter(email=value)

    def validate_first_name(self, queryset, name, value):
        # Add your custom validation logic for first name here
        if not value.isalpha():
            raise django_filters.exceptions.ValidationError("First name must contain only letters.")
        return queryset.filter(first_name=value)

    def validate_last_name(self, queryset, name, value):
        # Add your custom validation logic for last name here
        if not value.isalpha():
            raise django_filters.exceptions.ValidationError("Last name must contain only letters.")
        return queryset.filter(last_name=value)
    
class RoleFilter(django_filters.FilterSet):
    role_name = django_filters.CharFilter(method='validate_role_name')
    role_color = django_filters.CharFilter(method='validate_role_color')

    class Meta:
        model = Role
        fields = ['role_name', 'role_color']

    def validate_role_name(self, queryset, name, value):
        # Add your custom validation logic for role name here
        if not value.isalpha():
            raise django_filters.exceptions.ValidationError("Role name must contain only letters.")
        return queryset.filter(role_name=value)

    def validate_role_color(self, queryset, name, value):
        # Add your custom validation logic for role type here
        if not value.isalpha():
            raise django_filters.exceptions.ValidationError("Role type must contain only letters.")
        return queryset.filter(role_color=value)
    
class DepartementFilter(django_filters.FilterSet):
    dep_name = django_filters.CharFilter(method='validate_dep_name')
    dep_color = django_filters.CharFilter(method='validate_dep_color')

    class Meta:
        model = Departement
        fields = ['dep_name', 'dep_color']

    def validate_dep_name(self, queryset, name, value):
        # Add your custom validation logic for departement name here
        if not value.isalpha():
            raise django_filters.exceptions.ValidationError("Departement name must contain only letters.")
        return queryset.filter(dep_name=value)

    def validate_dep_color(self, queryset, name, value):
        # Add your custom validation logic for departement type here
        if not value.isalpha():
            raise django_filters.exceptions.ValidationError("Departement type must contain only letters.")
        return queryset.filter(dep_color=value)