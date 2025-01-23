from django.shortcuts import render
from rest_framework import viewsets
from .models import Workflow, Task
from .serializers import WorkflowSerializer, TaskSerializer

# Create your views here.
class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer