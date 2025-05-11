from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.authtoken.models import Token
from .models import Departement, Role

User = get_user_model()

class DepartementModelTest(TestCase):
    def test_departement_creation(self):
        """Test creating a departement"""
        departement = Departement.objects.create(
            dep_name="Engineering",
            dep_type="Technical"
        )
        self.assertEqual(str(departement), "Engineering - Technical")
        self.assertEqual(departement.dep_name, "Engineering")
        self.assertEqual(departement.dep_type, "Technical")

class RoleModelTest(TestCase):
    def test_role_creation(self):
        """Test creating a role"""
        role = Role.objects.create(
            role_name="Developer",
            role_type="Technical"
        )
        self.assertEqual(str(role), "Developer")
        self.assertEqual(role.role_name, "Developer")
        self.assertEqual(role.role_type, "Technical")

class CustomUserModelTest(TestCase):
    def test_user_creation(self):
        """Test creating a user with minimal fields"""
        departement = Departement.objects.create(
            dep_name="Engineering",
            dep_type="Technical"
        )
        role = Role.objects.create(
            role_name="Developer",
            role_type="Technical"
        )
        user = User.objects.create_user(
            username='testuser',
            password='12345',
            role=role,
            departement=departement
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('12345'))
        self.assertEqual(user.role, role)
        self.assertEqual(user.departement, departement)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        
        # Test string representation
        self.assertEqual(str(user), "testuser - Developer")
        
        # Test token creation signal
        self.assertTrue(Token.objects.filter(user=user).exists())
    
    def test_user_password_hashing(self):
        """Test that plain text passwords get hashed"""
        departement = Departement.objects.create(
            dep_name="Engineering",
            dep_type="Technical"
        )
        role = Role.objects.create(
            role_name="Developer",
            role_type="Technical"
        )
        
        user = User(
            username='testuser',
            password='plainpassword',
            role=role,
            departement=departement
        )
        user.save()
        
        # Check that password was hashed
        self.assertNotEqual(user.password, 'plainpassword')
        self.assertTrue(user.check_password('plainpassword'))
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        departement = Departement.objects.create(
            dep_name="Management",
            dep_type="Administrative"
        )
        role = Role.objects.create(
            role_name="CEO",
            role_type="Executive"
        )
        
        admin_user = User.objects.create_superuser(
            username='admin',
            password='adminpass',
            role=role,
            departement=departement
        )
        
        self.assertEqual(admin_user.username, 'admin')
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
    
    def test_user_without_username(self):
        """Test that creating a user without username raises error"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username=None,
                password='12345',
                role=Role.objects.create(role_name="Developer", role_type="Technical"),
                departement=Departement.objects.create(dep_name="Engineering", dep_type="Technical")
            )
    
    def test_user_without_role(self):
        """Test that creating a user without role raises error"""
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username='testuser',
                password='12345',
                role=None,
                departement=Departement.objects.create(dep_name="Engineering", dep_type="Technical")
            )
    
    def test_user_without_departement(self):
        """Test that creating a user without departement raises error"""
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username='testuser',
                password='12345',
                role=Role.objects.create(role_name="Developer", role_type="Technical"),
                departement=None
            )
    
    def test_user_token_creation_signal(self):
        """Test that token is created when user is created"""
        departement = Departement.objects.create(
            dep_name="Engineering",
            dep_type="Technical"
        )
        role = Role.objects.create(
            role_name="Developer",
            role_type="Technical"
        )
        
        user = User.objects.create_user(
            username='testuser',
            password='12345',
            role=role,
            departement=departement
        )
        
        self.assertTrue(Token.objects.filter(user=user).exists())
    
    def test_user_update(self):
        """Test updating a user"""
        departement = Departement.objects.create(
            dep_name="Engineering",
            dep_type="Technical"
        )
        role = Role.objects.create(
            role_name="Developer",
            role_type="Technical"
        )
        
        user = User.objects.create_user(
            username='testuser',
            password='12345',
            role=role,
            departement=departement
        )
        
        new_departement = Departement.objects.create(
            dep_name="Marketing",
            dep_type="Business"
        )
        new_role = Role.objects.create(
            role_name="Manager",
            role_type="Management"
        )
        
        user.departement = new_departement
        user.role = new_role
        user.save()
        
        updated_user = User.objects.get(username='testuser')
        self.assertEqual(updated_user.departement, new_departement)
        self.assertEqual(updated_user.role, new_role)
    
    def test_user_delete(self):
        """Test deleting a user"""
        departement = Departement.objects.create(
            dep_name="Engineering",
            dep_type="Technical"
        )
        role = Role.objects.create(
            role_name="Developer",
            role_type="Technical"
        )
        
        user = User.objects.create_user(
            username='testuser',
            password='12345',
            role=role,
            departement=departement
        )
        
        user.delete()
        self.assertFalse(User.objects.filter(username='testuser').exists())
    
    def test_user_unique_username(self):
        """Test that username must be unique"""
        departement = Departement.objects.create(
            dep_name="Engineering",
            dep_type="Technical"
        )
        role = Role.objects.create(
            role_name="Developer",
            role_type="Technical"
        )
        
        User.objects.create_user(
            username='testuser',
            password='12345',
            role=role,
            departement=departement
        )
        
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username='testuser',
                password='12345',
                role=role,
                departement=departement
            )