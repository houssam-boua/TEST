from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from .models import Workflow, Task
from .serializers import WorkflowSerializer, TaskSerializer

# Create your views here.
class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['workflow_name', 'workflow_type', 'workflow_status', 'workflow_owner', 
                        'workflow_departement', 'workflow_creation_date', 'workflow_modification_date',
                        'workflow_description', 'workflow_comment']
    #  GET /workflows/?workflow_name=test

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task_name', 'task_type', 'task_status', 'task_owner', 
                        'task_workflow', 'task_creation_date', 'task_modification_date',
                        'task_description', 'task_comment']
    #  GET /tasks/?task_name=test