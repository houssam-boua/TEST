# workflows/models.py (Enhanced)
from django.db import models
from django.utils import timezone
from users.models import User

class WorkflowStage(models.Model):
    """Defines workflow stages: Draft, Review, Approval, Publication"""
    DRAFT = 'draft'
    REVIEW = 'review'
    APPROVAL = 'approval'
    PUBLICATION = 'publication'
    
    STAGE_CHOICES = [
        (DRAFT, 'Draft'),
        (REVIEW, 'Review'),
        (APPROVAL, 'Approval'),
        (PUBLICATION, 'Publication'),
    ]
    
    name = models.CharField(max_length=50, choices=STAGE_CHOICES, unique=True)
    order = models.PositiveIntegerField(unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.get_name_display()

class Workflow(models.Model):
    """Enhanced workflow with sequential stages"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_review', 'In Review'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]
    
    nom = models.CharField(max_length=100)
    description = models.TextField()
    document = models.ForeignKey("documents.Document", on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    current_stage = models.ForeignKey(WorkflowStage, on_delete=models.PROTECT, null=True)
    
    # Assigned users for each stage
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='workflows_as_author')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='workflows_as_reviewer')
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='workflows_as_approver')
    publisher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='workflows_as_publisher')
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='workflows_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Timestamps for stage transitions
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    def can_user_see_stage(self, user, stage_name):
        """Sequential unlock logic - users only see tasks after previous stage completes"""
        stage_order = {
            'draft': 0,
            'review': 1,
            'approval': 2,
            'publication': 3
        }
        
        current_order = stage_order.get(self.status, 0)
        requested_order = stage_order.get(stage_name, 0)
        
        return requested_order <= current_order
    
    def validate_approver(self, approver_user):
        """Enforce segregation of duties: Author ≠ Approver (unless Admin)"""
        if approver_user.is_superuser:
            return True  # Admin can self-approve
        return self.author != approver_user
    
    class Meta:
        ordering = ['-created_at']

class Task(models.Model):
    """Enhanced task model with stage association"""
    STAGE_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'Review'),
        ('approval', 'Approval'),
        ('publication', 'Publication'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]
    
    task_name = models.CharField(max_length=100)
    task_workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='tasks')
    task_stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    task_assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    task_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    task_date_echeance = models.DateTimeField()
    task_priorite = models.CharField(max_length=20)
    
    # Visibility control
    is_visible = models.BooleanField(default=False, db_index=True)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='completed_tasks')
    
    notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['task_workflow', 'task_stage', 'task_date_echeance']
        indexes = [
            models.Index(fields=['task_workflow', 'is_visible']),
            models.Index(fields=['task_assigned_to', 'task_status']),
        ]

class ElectronicSignature(models.Model):
    """Track electronic signatures for approvals"""
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='signatures')
    signed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    signed_at = models.DateTimeField(default=timezone.now)
    signature_hash = models.CharField(max_length=256)  # SHA-256 hash
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    stage = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['-signed_at']
    
    def __str__(self):
        return f"{self.signed_by.username} - {self.stage} - {self.signed_at}"

class WorkflowNotification(models.Model):
    """Track email notifications sent during workflow"""
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='notifications')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50)  # 'review_ready', 'approval_ready', etc.
    subject = models.CharField(max_length=255)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    email_status = models.CharField(max_length=20, default='sent')  # sent, failed, bounced
    
    class Meta:
        ordering = ['-sent_at']
