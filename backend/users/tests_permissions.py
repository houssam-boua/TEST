# python
# backend/users/tests_permissions.py
# Purpose: Unit + API tests for user-group management endpoints and permission helpers.
# These tests exercise the admin-only group assign/remove/bulk flows and the effective-permissions endpoint.
from django.test import TestCase
from django.urls import reverse

from rest_framework.test import APIClient

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from .serializers import GroupSerializer
from . import utils as perm_utils

from .models import Role, Departement

User = get_user_model()


class PermissionsAPITest(TestCase):
    def setUp(self):
        # Create minimal required Role and Departement for User creation
        self.role = Role.objects.create(role_name="tester", role_color="blue")
        self.dep = Departement.objects.create(dep_name="eng", dep_color="#000")

        # Create an admin user (superuser) and a normal user
        try:
            # Prefer create_superuser if available on custom manager
            self.admin = User.objects.create_superuser(
                username="admin", email="admin@example.com", password="adminpass", role=self.role, departement=self.dep
            )
        except Exception:
            self.admin = User.objects.create_user(
                username="admin", email="admin@example.com", password="adminpass", role=self.role, departement=self.dep
            )
            self.admin.is_staff = True
            self.admin.is_superuser = True
            self.admin.save()

        self.user = User.objects.create_user(
            username="alice", email="alice@example.com", password="userpass", role=self.role, departement=self.dep
        )

        # API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_admin_can_add_group_by_name(self):
        url = reverse("user-groups", args=[self.user.id])
        payload = {"name": "Editors"}
        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        # Group exists and assigned
        grp = Group.objects.get(name__iexact="Editors")
        self.user.refresh_from_db()
        self.assertIn(grp, self.user.groups.all())

    def test_admin_can_add_group_by_id(self):
        grp = Group.objects.create(name="QA")
        url = reverse("user-groups", args=[self.user.id])
        payload = {"group_id": grp.id}
        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.user.refresh_from_db()
        self.assertIn(grp, self.user.groups.all())

    def test_admin_can_remove_group(self):
        grp = Group.objects.create(name="Removable")
        self.user.groups.add(grp)
        url = reverse("user-remove-group", args=[self.user.id, grp.id])
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, 204, resp.content)
        self.user.refresh_from_db()
        self.assertNotIn(grp, self.user.groups.all())

    def test_bulk_assign_groups(self):
        g1 = Group.objects.create(name="G1")
        g2 = Group.objects.create(name="G2")
        url = reverse("user-bulk-groups", args=[self.user.id])
        resp = self.client.post(url, {"group_ids": [g1.id, g2.id]}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.user.refresh_from_db()
        self.assertTrue(self.user.groups.filter(id__in=[g1.id, g2.id]).count(), 2)

    def test_list_groups(self):
        g = Group.objects.create(name="Lister")
        self.user.groups.add(g)
        url = reverse("user-groups", args=[self.user.id])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200, resp.content)
        data = resp.json()
        # Response shaped as {"groups": [...]}
        self.assertIn("groups", data)
        names = [g["name"] for g in data["groups"]]
        self.assertIn("Lister", names)

    def test_permissions_endpoint_includes_group_permission(self):
        # use an existing permission (auth.add_user) which should exist
        try:
            perm = Permission.objects.get(codename="add_user")
        except Permission.DoesNotExist:
            # Create a minimal permission against User model (best-effort)
            ct = ContentType.objects.get_for_model(User)
            perm = Permission.objects.create(codename="add_user", name="Can add user (test)", content_type=ct)

        grp = Group.objects.create(name="PermGroup")
        grp.permissions.add(perm)
        self.user.groups.add(grp)

        url = reverse("user-permissions", args=[self.user.id])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200, resp.content)
        data = resp.json()
        self.assertIn("permissions", data)
        self.assertIn(f"{perm.content_type.app_label}.{perm.codename}", data["permissions"])

    def test_get_effective_permissions_helper(self):
        # ensure helper returns expected permission strings
        try:
            perm = Permission.objects.get(codename="add_user")
        except Permission.DoesNotExist:
            ct = ContentType.objects.get_for_model(User)
            perm = Permission.objects.create(codename="add_user", name="Can add user (test)", content_type=ct)

        grp = Group.objects.create(name="HelperGroup")
        grp.permissions.add(perm)
        self.user.groups.add(grp)

        perms_set = perm_utils.get_effective_permissions(self.user)
        self.assertIsInstance(perms_set, set)
        self.assertIn(f"{perm.content_type.app_label}.{perm.codename}", perms_set)

    def test_has_any_and_has_all_helpers(self):
        # Create two permissions
        ct = ContentType.objects.get_for_model(User)
        p1, _ = Permission.objects.get_or_create(codename="test_perm_one", defaults={"name": "One", "content_type": ct})
        p2, _ = Permission.objects.get_or_create(codename="test_perm_two", defaults={"name": "Two", "content_type": ct})

        grp = Group.objects.create(name="HelperGroup2")
        grp.permissions.set([p1])
        self.user.groups.add(grp)

        # OR logic: should be True because user has p1 via group
        self.assertTrue(perm_utils.has_any_permission(self.user, [f"{ct.app_label}.{p1.codename}", f"{ct.app_label}.{p2.codename}"]))
        # AND logic: should be False because missing p2
        self.assertFalse(perm_utils.has_all_permissions(self.user, [f"{ct.app_label}.{p1.codename}", f"{ct.app_label}.{p2.codename}"]))
