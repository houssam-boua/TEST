from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from .models import Workflow, Task
from .serializers import WorkflowSerializer, TaskSerializer

from django.contrib.contenttypes.models import ContentType
from users.models import UserActionLog

# Create your views here.
class WorkflowViewSet(viewsets.ModelViewSet):
    """Workflow viewset for CRUD operations"""
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

    def create(self, serializer):
        workflow = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create",
            content_type=ContentType.objects.get_for_model(workflow),
            object_id=workflow.id,
            extra_info={"nom": workflow.nom}
        )

    def update(self, serializer):
        workflow = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update",
            content_type=ContentType.objects.get_for_model(workflow),
            object_id=workflow.id,
            extra_info={"nom": workflow.nom}
        )

    def delete(self, instance):
        workflow_id = instance.id
        nom = instance.nom
        instance.delete()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(Workflow),
            object_id=workflow_id,
            extra_info={"nom": nom}
        )

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

    def create(self, serializer):
        task = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create",
            content_type=ContentType.objects.get_for_model(task),
            object_id=task.id,
            extra_info={"task_name": task.task_name}
        )

    def update(self, serializer):
        task = serializer.save()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update",
            content_type=ContentType.objects.get_for_model(task),
            object_id=task.id,
            extra_info={"task_name": task.task_name}
        )

    def delete(self, instance):
        task_id = instance.id
        task_name = instance.task_name
        instance.delete()
        UserActionLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete",
            content_type=ContentType.objects.get_for_model(Task),
            object_id=task_id,
            extra_info={"task_name": task_name}
        )

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
