from rest_framework import serializers
from .models import Workflow, Task
from users.models import User
from users.serializers import UserMiniSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkflowSerializer(serializers.ModelSerializer):
    '''Workflow serializer for serializing workflow data'''
    class Meta:
        model = Workflow
        fields = "__all__"

class TaskSerializer(serializers.ModelSerializer):
    """Task serializer for serializing task data"""

    # keep PrimaryKeyRelatedField for write operations
    task_assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    task_workflow = serializers.PrimaryKeyRelatedField(
        queryset=Workflow.objects.all()
    )

    class Meta:
        model = Task
        fields = [
            'id',
            'task_name',
            'task_date_echeance',
            'task_priorite',
            'task_statut',
            'task_workflow',       # stays as the same field name
            'task_assigned_to',    # stays as the same field name
            'created_at',
            'updated_at',
        ]

    def to_representation(self, instance):
        """Return nested objects for `task_assigned_to` and `task_workflow`
        while keeping the fields writable as PKs for POST/PUT.
        """
        ret = super().to_representation(instance)

        # Replace the PK values with nested serialized data (read-only)
        # Protect against None values
        if instance.task_assigned_to is not None:
            ret['task_assigned_to'] = UserMiniSerializer(instance.task_assigned_to).data
        else:
            ret['task_assigned_to'] = None

        if instance.task_workflow is not None:
            ret['task_workflow'] = WorkflowSerializer(instance.task_workflow).data
        else:
            ret['task_workflow'] = None

        return ret
