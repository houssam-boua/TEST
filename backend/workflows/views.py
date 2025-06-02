from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from .models import Workflow, Task
from .serializers import WorkflowSerializer, TaskSerializer


# Create your views here.
class WorkflowViewSet(viewsets.ModelViewSet):
    """Workflow viewset for CRUD operations"""
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        "nom",
        "description",
        "etat",
        "document",
    ]
    #  GET /workflows/?workflow_name=test


class TaskViewSet(viewsets.ModelViewSet):
    """Task viewset for CRUD operations"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        "task_name",
        "task_date_echeance",
        "task_priorite",
        "task_statut",
        "task_workflow",
        "task_assigned_to",
    ]
    #  GET /tasks/?task_name=test
