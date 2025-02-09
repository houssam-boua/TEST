from rest_framework import serializers
from .models import Workflow, Task


class WorkflowSerializer(serializers.ModelSerializer):
    '''Workflow serializer for serializing workflow data'''
    class Meta:
        model = Workflow
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    """Task serializer for serializing task data"""
    class Meta:
        model = Task
        fields = "__all__"
