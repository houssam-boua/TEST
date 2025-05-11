# Renaming this file to test_workflows.py for proper test discovery.
# Adding basic test cases for the workflows app.

import pytest
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Workflow

@pytest.mark.django_db
def test_workflow_creation():
    workflow = Workflow.objects.create(
        nom="Test Workflow",
        description="Workflow description",
        etat="Active",
    )
    assert workflow.nom == "Test Workflow"
    assert workflow.description == "Workflow description"
    assert workflow.etat == "Active"

@pytest.mark.django_db
def test_workflow_update():
    workflow = Workflow.objects.create(
        nom="Test Workflow",
        description="Workflow description",
        etat="Active",
    )
    workflow.nom = "Updated Workflow"
    workflow.save()
    assert workflow.nom == "Updated Workflow"

@pytest.mark.django_db
def test_workflow_deletion():
    workflow = Workflow.objects.create(
        nom="Test Workflow",
        description="Workflow description",
        etat="Active",
    )
    workflow_id = workflow.id
    workflow.delete()
    assert not Workflow.objects.filter(id=workflow_id).exists()