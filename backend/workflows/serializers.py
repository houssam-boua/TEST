# workflows/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Workflow, 
    Task, 
    WorkflowStage, 
    ElectronicSignature, 
    WorkflowNotification
)
from users.serializers import UserMiniSerializer
from documents.models import Document
from documents.serializers import DocumentMiniSerializer

User = get_user_model()


class WorkflowStageSerializer(serializers.ModelSerializer):
    """Serializer for workflow stages (Draft, Review, Approval, Publication)"""
    
    class Meta:
        model = WorkflowStage
        fields = ['id', 'name', 'order', 'description']
        read_only_fields = ['id']


class ElectronicSignatureSerializer(serializers.ModelSerializer):
    """Serializer for electronic signatures with audit trail"""
    signed_by = UserMiniSerializer(read_only=True)
    
    class Meta:
        model = ElectronicSignature
        fields = [
            'id',
            'workflow',
            'signed_by',
            'signed_at',
            'signature_hash',
            'ip_address',
            'user_agent',
            'stage',
        ]
        read_only_fields = [
            'id',
            'signed_at',
            'signature_hash',
            'ip_address',
            'user_agent',
        ]


class WorkflowNotificationSerializer(serializers.ModelSerializer):
    """Serializer for workflow email notifications"""
    recipient = UserMiniSerializer(read_only=True)
    
    class Meta:
        model = WorkflowNotification
        fields = [
            'id',
            'workflow',
            'recipient',
            'notification_type',
            'subject',
            'message',
            'sent_at',
            'read_at',
            'email_status',
        ]
        read_only_fields = ['id', 'sent_at']


class WorkflowSerializer(serializers.ModelSerializer):
    """Enhanced workflow serializer with GED lifecycle support"""
    
    # Write operations use PKs
    document = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all()
    )
    author = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    reviewer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    approver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    publisher = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    current_stage = serializers.PrimaryKeyRelatedField(
        queryset=WorkflowStage.objects.all(),
        required=False,
        allow_null=True
    )
    
    # Read-only computed fields
    can_submit = serializers.SerializerMethodField()
    can_review = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()
    can_publish = serializers.SerializerMethodField()
    
    # ✅ BACKWARD COMPATIBILITY: Add etat as read-only alias for status
    etat = serializers.CharField(source='status', read_only=True)
    
    class Meta:
        model = Workflow
        fields = [
            'id',
            'nom',
            'description',
            'document',
            'status',
            'current_stage',
            # Assigned users
            'author',
            'reviewer',
            'approver',
            'publisher',
            # Timestamps
            'created_by',
            'created_at',
            'updated_at',
            'submitted_at',
            'reviewed_at',
            'approved_at',
            'published_at',
            # Legacy field (backward compatibility) - READ ONLY
            'etat',  # ✅ ADDED FOR BACKWARD COMPATIBILITY
            # Permission helpers
            'can_submit',
            'can_review',
            'can_approve',
            'can_publish',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'submitted_at',
            'reviewed_at',
            'approved_at',
            'published_at',
            'can_submit',
            'can_review',
            'can_approve',
            'can_publish',
            'etat',  # ✅ READ ONLY
        ]
    
    def get_can_submit(self, obj):
        """Check if current user can submit for review"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        return (
            obj.status == 'draft' and
            (obj.author == user or user.is_superuser)
        )
    
    def get_can_review(self, obj):
        """Check if current user can review"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        return (
            obj.status == 'in_review' and
            (obj.reviewer == user or user.is_superuser)
        )
    
    def get_can_approve(self, obj):
        """Check if current user can approve (with segregation check)"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        
        # Admin can always approve
        if user.is_superuser:
            return obj.status == 'pending_approval'
        
        # Standard users: check segregation of duties
        return (
            obj.status == 'pending_approval' and
            obj.approver == user and
            obj.author != user  # Cannot approve own document
        )
    
    def get_can_publish(self, obj):
        """Check if current user can publish"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        return (
            obj.status == 'approved' and
            (obj.publisher == user or user.is_superuser)
        )
    
    def to_representation(self, instance):
        """Expand nested objects for read operations"""
        ret = super().to_representation(instance)
        
        # Expand document
        if instance.document is not None:
            ret['document'] = DocumentMiniSerializer(instance.document).data
        else:
            ret['document'] = None
        
        # Expand assigned users
        if instance.author is not None:
            ret['author'] = UserMiniSerializer(instance.author).data
        else:
            ret['author'] = None
        
        if instance.reviewer is not None:
            ret['reviewer'] = UserMiniSerializer(instance.reviewer).data
        else:
            ret['reviewer'] = None
        
        if instance.approver is not None:
            ret['approver'] = UserMiniSerializer(instance.approver).data
        else:
            ret['approver'] = None
        
        if instance.publisher is not None:
            ret['publisher'] = UserMiniSerializer(instance.publisher).data
        else:
            ret['publisher'] = None
        
        if instance.created_by is not None:
            ret['created_by'] = UserMiniSerializer(instance.created_by).data
        else:
            ret['created_by'] = None
        
        # Expand current stage
        if instance.current_stage is not None:
            ret['current_stage'] = WorkflowStageSerializer(instance.current_stage).data
        else:
            ret['current_stage'] = None
        
        # Add signature count (if any)
        ret['signatures_count'] = instance.signatures.count() if hasattr(instance, 'signatures') else 0
        
        # Add latest signature info for approved workflows
        if instance.status in ['approved', 'published'] and hasattr(instance, 'signatures'):
            latest_sig = instance.signatures.order_by('-signed_at').first()
            if latest_sig:
                ret['latest_signature'] = ElectronicSignatureSerializer(latest_sig).data
            else:
                ret['latest_signature'] = None
        
        return ret
    
def validate(self, data):
    if self.instance is None:
        if not data.get('author'):
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                data['author'] = request.user

        author = data.get('author', getattr(self.instance, 'author', None))
        reviewer = data.get('reviewer', getattr(self.instance, 'reviewer', None))
        approver = data.get('approver', getattr(self.instance, 'approver', None))
        publisher = data.get('publisher', getattr(self.instance, 'publisher', None))

        # Collect all assigned users
        assigned_users = []
        if author:
            assigned_users.append(author)
        if reviewer:
            assigned_users.append(reviewer)
        if approver:
            assigned_users.append(approver)
        if publisher:
            assigned_users.append(publisher)

        # Check if same user is assigned to multiple roles
        if len(assigned_users) != len(set(assigned_users)):
            # Same user detected - check if they're admin
            # Find the duplicated user
            duplicated_user = None
            for user in assigned_users:
                if assigned_users.count(user) > 1:
                    duplicated_user = user
                    break
            
            if duplicated_user:
                is_admin = duplicated_user.is_superuser or duplicated_user.is_staff
                if not is_admin:
                    raise serializers.ValidationError({
                        "approver": "Segregation of Duties Violation: The same user cannot be assigned to multiple roles unless they are an Admin."
                    })

    return data



class TaskSerializer(serializers.ModelSerializer):
    """Enhanced task serializer with visibility and stage support"""
    
    # Write operations use PKs
    task_assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    task_workflow = serializers.PrimaryKeyRelatedField(
        queryset=Workflow.objects.all()
    )
    completed_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    
    # Read-only computed fields
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    can_complete = serializers.SerializerMethodField()
    
    # ✅ BACKWARD COMPATIBILITY: Add task_statut as alias for task_status
    task_statut = serializers.CharField(source='task_status', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id',
            'task_name',
            'task_workflow',
            'task_stage',
            'task_assigned_to',
            'task_status',
            'task_date_echeance',
            'task_priorite',
            # Visibility control
            'is_visible',
            'unlocked_at',
            'completed_at',
            'completed_by',
            # Notes and rejection
            'notes',
            'rejection_reason',
            # Timestamps
            'created_at',
            'updated_at',
            # Computed fields
            'is_overdue',
            'days_until_due',
            'can_complete',
            # Legacy field (backward compatibility)
            'task_statut',  # ✅ ADDED FOR BACKWARD COMPATIBILITY
        ]
        read_only_fields = [
            'id',
            'unlocked_at',
            'completed_at',
            'created_at',
            'updated_at',
            'is_overdue',
            'days_until_due',
            'can_complete',
            'task_statut',  # ✅ READ ONLY
        ]
    
    def get_is_overdue(self, obj):
        """Check if task is overdue"""
        from django.utils import timezone
        if obj.task_status in ['completed', 'rejected']:
            return False
        if not obj.task_date_echeance:
            return False
        return timezone.now() > obj.task_date_echeance
    
    def get_days_until_due(self, obj):
        """Calculate days until due date"""
        from django.utils import timezone
        if not obj.task_date_echeance:
            return None
        delta = obj.task_date_echeance - timezone.now()
        return delta.days
    
    def get_can_complete(self, obj):
        """Check if current user can complete this task"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        return (
            obj.is_visible and
            obj.task_status not in ['completed', 'rejected'] and
            (obj.task_assigned_to == user or user.is_superuser)
        )
    
    def to_representation(self, instance):
        """Expand nested objects for read operations"""
        ret = super().to_representation(instance)
        
        # Expand assigned user
        if instance.task_assigned_to is not None:
            ret['task_assigned_to'] = UserMiniSerializer(instance.task_assigned_to).data
        else:
            ret['task_assigned_to'] = None
        
        # Expand workflow with limited fields to avoid circular references
        if instance.task_workflow is not None:
            workflow = instance.task_workflow
            ret['task_workflow'] = {
                'id': workflow.id,
                'nom': workflow.nom,
                'status': workflow.status,
                'document': DocumentMiniSerializer(workflow.document).data if workflow.document else None,
            }
        else:
            ret['task_workflow'] = None
        
        # Expand completed_by
        if instance.completed_by is not None:
            ret['completed_by'] = UserMiniSerializer(instance.completed_by).data
        else:
            ret['completed_by'] = None
        
        return ret
    
    def validate(self, data):
        """Validate task data"""
        # Ensure task_stage matches workflow status when creating
        if self.instance is None:  # Creating new task
            workflow = data.get('task_workflow')
            task_stage = data.get('task_stage')
            
            if workflow and task_stage:
                stage_status_map = {
                    'draft': 'draft',
                    'review': 'in_review',
                    'approval': 'pending_approval',
                    'publication': 'approved',
                }
                expected_status = stage_status_map.get(task_stage)
                if expected_status and workflow.status != expected_status:
                    # Allow creation but warn
                    pass
        
        return data


class TaskMinimalSerializer(serializers.ModelSerializer):
    """Minimal task serializer for nested representations (prevents circular refs)"""
    task_assigned_to = UserMiniSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id',
            'task_name',
            'task_stage',
            'task_status',
            'task_assigned_to',
            'is_visible',
            'task_date_echeance',
        ]


class WorkflowDetailSerializer(WorkflowSerializer):
    """Extended workflow serializer with all related tasks and signatures"""
    tasks = TaskMinimalSerializer(many=True, read_only=True)
    signatures = ElectronicSignatureSerializer(many=True, read_only=True)
    notifications = WorkflowNotificationSerializer(many=True, read_only=True)
    
    class Meta(WorkflowSerializer.Meta):
        fields = WorkflowSerializer.Meta.fields + [
            'tasks',
            'signatures',
            'notifications',
        ]


class WorkflowActionSerializer(serializers.Serializer):
    """Serializer for workflow action requests (review, reject, etc.)"""
    action = serializers.ChoiceField(
        choices=['pass', 'reject'],
        required=True,
        help_text="Action to perform: 'pass' or 'reject'"
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Required when action is 'reject'"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional notes for any action"
    )
    
    def validate(self, data):
        """Ensure rejection reason is provided when rejecting"""
        if data.get('action') == 'reject' and not data.get('reason', '').strip():
            raise serializers.ValidationError({
                'reason': 'Rejection reason is required when rejecting a document'
            })
        return data


class TaskBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk task status updates"""
    task_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        help_text="List of task IDs to update"
    )
    task_status = serializers.ChoiceField(
        choices=['pending', 'in_progress', 'completed', 'rejected'],
        required=True,
        help_text="New status for all tasks"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional notes for the update"
    )
