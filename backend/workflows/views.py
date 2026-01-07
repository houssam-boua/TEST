# workflows/views.py
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from django.db.models import Q, Count, Avg, F
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, status, filters
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
import hashlib
import uuid
import logging
from rest_framework.decorators import api_view, permission_classes

from .models import (
    Workflow,
    Task,
    WorkflowStage,
    ElectronicSignature,
    WorkflowNotification
)
from .serializers import (
    WorkflowSerializer,
    WorkflowDetailSerializer,
    TaskSerializer,
    TaskMinimalSerializer,
    WorkflowStageSerializer,
    ElectronicSignatureSerializer,
    WorkflowNotificationSerializer,
    WorkflowActionSerializer,
    TaskBulkUpdateSerializer,
)
from users.models import UserActionLog

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workflows_by_state(request):
    """Get workflow counts by status"""
    stats = Workflow.objects.values('status').annotate(count=Count('id'))
    
    result = {item['status']: item['count'] for item in stats}
    
    return Response(result)

class WorkflowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing GED workflows with sequential stages:
    Draft → Review → Approval → Publication
    """
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'author', 'reviewer', 'approver', 'publisher', 'document']
    search_fields = ['nom', 'description']
    ordering_fields = ['created_at', 'updated_at', 'submitted_at', 'published_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        qs = super().get_queryset()
        user = self.request.user
        
        # Admins see all workflows
        if user.is_superuser or user.is_staff:
            return qs.select_related(
                'document', 'author', 'reviewer', 'approver', 'publisher', 
                'created_by', 'current_stage'
            ).prefetch_related('tasks', 'signatures', 'notifications')
        
        # Regular users see only workflows they're involved in
        return qs.filter(
            Q(author=user) | 
            Q(reviewer=user) | 
            Q(approver=user) | 
            Q(publisher=user) |
            Q(created_by=user)
        ).distinct().select_related(
            'document', 'author', 'reviewer', 'approver', 'publisher', 
            'created_by', 'current_stage'
        ).prefetch_related('tasks', 'signatures', 'notifications')
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return WorkflowDetailSerializer
        return WorkflowSerializer
    
    # --- HELPER: Sync Document Status ---
    def _update_doc_status(self, workflow, new_status):
        """
        Updates the linked Document's status to match the Workflow's progress.
        Checks for 'doc_status', 'status', or fallback to 'doc_status_type'.
        """
        if workflow.document:
            try:
                updated = False
                doc = workflow.document
                
                # 1. Try 'doc_status' (Ideal custom field)
                if hasattr(doc, 'doc_status'):
                    doc.doc_status = new_status
                    doc.save(update_fields=['doc_status'])
                    updated = True
                
                # 2. Try 'status' (Common naming)
                elif hasattr(doc, 'status'):
                    doc.status = new_status
                    doc.save(update_fields=['status'])
                    updated = True
                
                # 3. Fallback to 'doc_status_type'
                elif hasattr(doc, 'doc_status_type'):
                    doc.doc_status_type = new_status
                    doc.save(update_fields=['doc_status_type'])
                    updated = True
                
                if updated:
                    logger.info(f"Synced document {doc.id} status to '{new_status}'")
                else:
                    logger.warning(f"Could not sync status: Document {doc.id} has no compatible status field.")
                    
            except Exception as e:
                logger.error(f"Failed to sync document status for workflow {workflow.id}: {str(e)}")
    # ------------------------------------

    def perform_create(self, serializer):
        """Admin creates workflow and assigns specific users to each stage"""
        
        # 1. Validation: Segregation of Duties
        author = serializer.validated_data.get('author')
        approver = serializer.validated_data.get('approver')
        
        # Rule: Author and Approver must be different...
        if author and approver and author == approver:
            # ...UNLESS the SELECTED user (author/approver) is an Admin.
            is_selected_admin = author.is_superuser or author.is_staff
            
            if not is_selected_admin:
                raise serializers.ValidationError({
                    'approver': 'Segregation of Duties: The Author cannot be the Approver, unless the selected user is an Administrator.'
                })
        
        # 2. Save Workflow
        workflow = serializer.save(created_by=self.request.user)
        
        # 3. Create tasks for each stage
        self._create_stage_tasks(workflow)
        
        # 4. Update Document Status to 'pending' immediately
        self._update_doc_status(workflow, 'pending')
        
        # 5. Notify the Author
        try:
            if workflow.author:
                recipient_name = workflow.author.get_full_name() or workflow.author.username
                self._send_notification(
                    workflow=workflow,
                    recipient=workflow.author,
                    notification_type='workflow_assigned',
                    subject=f"New Workflow Assigned: {workflow.document.doc_title}",
                    message=self._build_email_message(
                        workflow=workflow,
                        action='created',
                        recipient_name=recipient_name
                    )
                )
            else:
                logger.warning(f"Workflow {workflow.id} created but no author assigned for email.")
        except Exception as e:
            logger.error(f"Failed to send creation notification for workflow {workflow.id}: {str(e)}")
        
        # 6. Log creation
        UserActionLog.objects.create(
            user=self.request.user,
            action='create_workflow',
            content_type=ContentType.objects.get_for_model(Workflow),
            object_id=workflow.id,
            extra_info={
                'workflow_name': workflow.nom,
                'document_id': workflow.document.id if workflow.document else None,
            }
        )
        
        logger.info(f"Workflow created: {workflow.id} by user {self.request.user.id}")
    
    def _create_stage_tasks(self, workflow):
        """Create sequential tasks for each workflow stage"""
        stages = [
            ('draft', workflow.author, 'Create document draft', 'normal'),
            ('review', workflow.reviewer, 'Review document', 'high'),
            ('approval', workflow.approver, 'Approve document', 'high'),
            ('publication', workflow.publisher, 'Publish document', 'normal'),
        ]
        
        for idx, (stage, assigned_user, task_name, priority) in enumerate(stages):
            if assigned_user:
                Task.objects.create(
                    task_workflow=workflow,
                    task_name=f"{task_name}: {workflow.document.doc_title}",
                    task_stage=stage,
                    task_assigned_to=assigned_user,
                    task_status='pending',
                    task_priorite=priority,
                    task_date_echeance=timezone.now() + timezone.timedelta(days=7*(idx+1)),
                    is_visible=(idx == 0)  # Only first task visible initially
                )
        
        logger.info(f"Created {len([s for s in stages if s[1]])} tasks for workflow {workflow.id}")
    
    
    @action(detail=True, methods=['post'], url_path='submit-for-review')
    def submit_for_review(self, request, pk=None):
        """
        Step 1: Author submits draft for review
        """
        workflow = self.get_object()
        
        if workflow.status != 'draft':
            return Response(
                {'error': 'Can only submit drafts', 'current_status': workflow.status},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user != workflow.author and not request.user.is_superuser:
            return Response(
                {'error': 'Only author can submit'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        with transaction.atomic():
            # Update workflow status
            workflow.status = 'in_review'
            workflow.submitted_at = timezone.now()
            workflow.save(update_fields=['status', 'submitted_at'])
            
            # Mark author's task as completed
            Task.objects.filter(
                task_workflow=workflow,
                task_stage='draft'
            ).update(
                task_status='completed',
                completed_at=timezone.now(),
                completed_by=request.user
            )
            
            # Unlock reviewer's task
            reviewer_task = Task.objects.filter(
                task_workflow=workflow,
                task_stage='review'
            ).first()
            
            if reviewer_task:
                reviewer_task.is_visible = True
                reviewer_task.unlocked_at = timezone.now()
                reviewer_task.save(update_fields=['is_visible', 'unlocked_at'])
                
                try:
                    if workflow.reviewer:
                        recipient_name = workflow.reviewer.get_full_name() or workflow.reviewer.username
                        
                        self._send_notification(
                            workflow=workflow,
                            recipient=workflow.reviewer,
                            notification_type='review_ready',
                            subject=f"Document Ready for Review: {workflow.document.doc_title}",
                            message=self._build_email_message(
                                workflow=workflow,
                                action='review',
                                recipient_name=recipient_name
                            )
                        )
                    else:
                        logger.warning(f"Workflow {workflow.id} submitted but no reviewer assigned for email.")
                except Exception as e:
                    logger.error(f"Failed to send submission notification for workflow {workflow.id}: {str(e)}")
            
            # Log action
            UserActionLog.objects.create(
                user=request.user,
                action='submit_for_review',
                content_type=ContentType.objects.get_for_model(Workflow),
                object_id=workflow.id,
                extra_info={'submitted_at': workflow.submitted_at.isoformat()}
            )
        
        logger.info(f"Workflow {workflow.id} submitted for review by user {request.user.id}")
        return Response({
            'status': 'submitted_for_review',
            'workflow_status': workflow.status,
            'submitted_at': workflow.submitted_at
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='validate-review')
    def validate_review(self, request, pk=None):
        """
        Step 2: Reviewer validates or rejects
        """
        workflow = self.get_object()
        
        serializer = WorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action_type = serializer.validated_data.get('action')
        reason = serializer.validated_data.get('reason', '')
        notes = serializer.validated_data.get('notes', '')
        
        if workflow.status != 'in_review':
            return Response(
                {'error': 'Not in review stage', 'current_status': workflow.status},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user != workflow.reviewer and not request.user.is_superuser:
            return Response(
                {'error': 'Only assigned reviewer can act'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        with transaction.atomic():
            if action_type == 'reject':
                # Reset to draft
                workflow.status = 'draft'
                workflow.save(update_fields=['status'])
                
                # 2. Update Document Status to 'rejected'
                self._update_doc_status(workflow, 'rejected')
                
                # Update tasks
                Task.objects.filter(
                    task_workflow=workflow,
                    task_stage='review'
                ).update(
                    task_status='rejected',
                    rejection_reason=reason,
                    notes=notes,
                    completed_at=timezone.now(),
                    completed_by=request.user
                )
                
                # Re-unlock author's task
                Task.objects.filter(
                    task_workflow=workflow,
                    task_stage='draft'
                ).update(
                    task_status='pending',
                    is_visible=True,
                    notes=f"Rejected by reviewer: {reason}"
                )
                
                try:
                    if workflow.author:
                        recipient_name = workflow.author.get_full_name() or workflow.author.username
                        self._send_notification(
                            workflow=workflow,
                            recipient=workflow.author,
                            notification_type='review_rejected',
                            subject=f"Document Rejected: {workflow.document.doc_title}",
                            message=self._build_email_message(
                                workflow=workflow,
                                action='rejected',
                                recipient_name=recipient_name,
                                reason=reason
                            )
                        )
                except Exception as e:
                    logger.error(f"Failed to send rejection notification for workflow {workflow.id}: {str(e)}")
                
                UserActionLog.objects.create(
                    user=request.user,
                    action='reject_review',
                    content_type=ContentType.objects.get_for_model(Workflow),
                    object_id=workflow.id,
                    extra_info={'reason': reason, 'notes': notes}
                )
                
                return Response({
                    'status': 'rejected',
                    'reason': reason,
                    'workflow_status': workflow.status
                }, status=status.HTTP_200_OK)
            
            # Pass review
            workflow.status = 'pending_approval'
            workflow.reviewed_at = timezone.now()
            workflow.save(update_fields=['status', 'reviewed_at'])
            
            # Complete reviewer task
            Task.objects.filter(
                task_workflow=workflow,
                task_stage='review'
            ).update(
                task_status='completed',
                notes=notes,
                completed_at=timezone.now(),
                completed_by=request.user
            )
            
            # Unlock approver task
            approver_task = Task.objects.filter(
                task_workflow=workflow,
                task_stage='approval'
            ).first()
            
            if approver_task:
               # Check if Author and Approver are same (only allowed for Admin)
               if workflow.author == workflow.approver:
                    if not (workflow.approver.is_superuser or workflow.approver.is_staff):
                        return Response({
                            "error": "Segregation of Duties: Author and Approver cannot be the same unless Admin.",
                            "author_id": workflow.author.id,
                            "approver_id": workflow.approver.id
                        }, status=status.HTTP_400_BAD_REQUEST)
                
               approver_task.is_visible = True
               approver_task.unlocked_at = timezone.now()
               approver_task.save(update_fields=['is_visible', 'unlocked_at'])
                
               try:
                    if workflow.approver:
                        recipient_name = workflow.approver.get_full_name() or workflow.approver.username
                        self._send_notification(
                            workflow=workflow,
                            recipient=workflow.approver,
                            notification_type='approval_ready',
                            subject=f"Document Requires Approval: {workflow.document.doc_title}",
                            message=self._build_email_message(
                                workflow=workflow,
                                action='approve',
                                recipient_name=recipient_name
                            )
                        )
               except Exception as e:
                    logger.error(f"Failed to send approval ready notification for workflow {workflow.id}: {str(e)}")
            
            UserActionLog.objects.create(
                user=request.user,
                action='validate_review',
                content_type=ContentType.objects.get_for_model(Workflow),
                object_id=workflow.id,
                extra_info={'reviewed_at': workflow.reviewed_at.isoformat(), 'notes': notes}
            )
        
        logger.info(f"Workflow {workflow.id} review validated by user {request.user.id}")
        return Response({
            'status': 'review_passed',
            'workflow_status': workflow.status,
            'reviewed_at': workflow.reviewed_at
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='approve-sign')
    def approve_sign(self, request, pk=None):
        """
        Step 3: Approver signs electronically
        """
        workflow = self.get_object()
        
        if workflow.status != 'pending_approval':
            return Response(
                {'error': 'Not in approval stage', 'current_status': workflow.status},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user != workflow.approver and not request.user.is_superuser:
            return Response(
                {'error': 'Only assigned approver can sign'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validation: Segregation of duties
        if workflow.author == request.user:
            if not (request.user.is_superuser or request.user.is_staff):
                return Response(
                    {
                        'error': 'Segregation of duties violation',
                        'message': 'Author cannot approve their own document (unless Admin)'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        
        with transaction.atomic():
            # Generate electronic signature
            signature_data = f"{workflow.id}:{request.user.id}:{timezone.now().isoformat()}:{uuid.uuid4()}"
            signature_hash = hashlib.sha256(signature_data.encode()).hexdigest()
            
            signature = ElectronicSignature.objects.create(
                workflow=workflow,
                signed_by=request.user,
                signature_hash=signature_hash,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:255],
                stage='approval'
            )
            
            workflow.status = 'approved'
            workflow.approved_at = timezone.now()
            workflow.save(update_fields=['status', 'approved_at'])
            
            # 3. Update Document Status to 'approved'
            self._update_doc_status(workflow, 'approved')
            
            # Complete approval task
            Task.objects.filter(
                task_workflow=workflow,
                task_stage='approval'
            ).update(
                task_status='completed',
                completed_at=timezone.now(),
                completed_by=request.user,
                notes=f"Electronically signed: {signature_hash[:16]}..."
            )
            
            # Unlock publisher task
            publisher_task = Task.objects.filter(
                task_workflow=workflow,
                task_stage='publication'
            ).first()
            
            if publisher_task:
                publisher_task.is_visible = True
                publisher_task.unlocked_at = timezone.now()
                publisher_task.save(update_fields=['is_visible', 'unlocked_at'])
                
                try:
                    if workflow.publisher:
                        recipient_name = workflow.publisher.get_full_name() or workflow.publisher.username
                        self._send_notification(
                            workflow=workflow,
                            recipient=workflow.publisher,
                            notification_type='publish_ready',
                            subject=f"Document Ready to Publish: {workflow.document.doc_title}",
                            message=self._build_email_message(
                                workflow=workflow,
                                action='publish',
                                recipient_name=recipient_name
                            )
                        )
                except Exception as e:
                    logger.error(f"Failed to send publish ready notification for workflow {workflow.id}: {str(e)}")
            
            UserActionLog.objects.create(
                user=request.user,
                action='approve_sign',
                content_type=ContentType.objects.get_for_model(Workflow),
                object_id=workflow.id,
                extra_info={
                    'approved_at': workflow.approved_at.isoformat(),
                    'signature_hash': signature_hash,
                    'ip_address': signature.ip_address
                }
            )
        
        logger.info(f"Workflow {workflow.id} approved and signed by user {request.user.id}")
        return Response({
            'status': 'approved',
            'signature': signature_hash,
            'workflow_status': workflow.status,
            'approved_at': workflow.approved_at,
            'signed_by': request.user.username
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        """
        Step 4: Publisher releases document
        """
        workflow = self.get_object()
        
        if workflow.status != 'approved':
            return Response(
                {'error': 'Document not approved yet', 'current_status': workflow.status},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user != workflow.publisher and not request.user.is_superuser:
            return Response(
                {'error': 'Only assigned publisher can publish'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        with transaction.atomic():
            workflow.status = 'published'
            workflow.published_at = timezone.now()
            workflow.save(update_fields=['status', 'published_at'])
            
            # 4. Update Document Status to 'public' (and lock it)
            if workflow.document:
                self._update_doc_status(workflow, 'public')
                
                # Lock document as immutable original
                workflow.document.doc_status_type = 'ORIGINAL'
                workflow.document.save(update_fields=['doc_status_type'])
            
            # Complete publication task
            Task.objects.filter(
                task_workflow=workflow,
                task_stage='publication'
            ).update(
                task_status='completed',
                completed_at=timezone.now(),
                completed_by=request.user
            )
            
            try:
                stakeholders = [
                    workflow.author,
                    workflow.reviewer,
                    workflow.approver,
                    workflow.publisher
                ]
                
                for user in stakeholders:
                    if user and user.email:
                        recipient_name = user.get_full_name() or user.username
                        self._send_notification(
                            workflow=workflow,
                            recipient=user,
                            notification_type='document_published',
                            subject=f"Document Published: {workflow.document.doc_title}",
                            message=self._build_email_message(
                                workflow=workflow,
                                action='published',
                                recipient_name=recipient_name
                            )
                        )
            except Exception as e:
                logger.error(f"Failed to send publication notifications for workflow {workflow.id}: {str(e)}")
            
            UserActionLog.objects.create(
                user=request.user,
                action='publish_document',
                content_type=ContentType.objects.get_for_model(Workflow),
                object_id=workflow.id,
                extra_info={'published_at': workflow.published_at.isoformat()}
            )
        
        logger.info(f"Workflow {workflow.id} published by user {request.user.id}")
        return Response({
            'status': 'published',
            'workflow_status': workflow.status,
            'published_at': workflow.published_at
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='my-workflows')
    def my_workflows(self, request):
        """Get workflows where current user is involved"""
        user = request.user
        workflows = self.get_queryset().filter(
            Q(author=user) | 
            Q(reviewer=user) | 
            Q(approver=user) | 
            Q(publisher=user)
        ).distinct()
        
        page = self.paginate_queryset(workflows)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(workflows, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='pending-action')
    def pending_action(self, request):
        """Get workflows requiring current user's action"""
        user = request.user
        workflows = []
        
        # Draft stage: author can submit
        workflows.extend(
            Workflow.objects.filter(author=user, status='draft')
        )
        
        # Review stage: reviewer can validate
        workflows.extend(
            Workflow.objects.filter(reviewer=user, status='in_review')
        )
        
        # Approval stage: approver can sign
        workflows.extend(
            Workflow.objects.filter(approver=user, status='pending_approval')
        )
        
        # Publication stage: publisher can release
        workflows.extend(
            Workflow.objects.filter(publisher=user, status='approved')
        )
        
        serializer = self.get_serializer(workflows, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get complete workflow audit history"""
        workflow = self.get_object()
        ct = ContentType.objects.get_for_model(Workflow)
        
        logs = UserActionLog.objects.filter(
            content_type=ct,
            object_id=workflow.id
        ).select_related('user').order_by('-timestamp')
        
        return Response({
            'workflow_id': workflow.id,
            'workflow_name': workflow.nom,
            'logs': [
                {
                    'user': log.user.username if log.user else 'System',
                    'user_full_name': log.user.get_full_name() if log.user else 'System',
                    'action': log.action,
                    'timestamp': log.timestamp,
                    'extra_info': log.extra_info,
                }
                for log in logs
            ]
        })
    
    @action(detail=True, methods=['get'], url_path='signatures')
    def signatures(self, request, pk=None):
        """Get all electronic signatures for this workflow"""
        workflow = self.get_object()
        signatures = workflow.signatures.select_related('signed_by').order_by('-signed_at')
        serializer = ElectronicSignatureSerializer(signatures, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='notifications')
    def notifications(self, request, pk=None):
        """Get all notifications for this workflow"""
        workflow = self.get_object()
        notifications = workflow.notifications.select_related('recipient').order_by('-sent_at')
        serializer = WorkflowNotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_users(self, request, pk=None):
        """
        Admin: reassign workflow users AND update corresponding pending tasks.
        """
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {'error': 'Admin only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        workflow = self.get_object()
        updated_fields = []
        
        # Helper to update Task if workflow user changes
        def update_task_assignment(stage_name, new_user_id):
            # Only update tasks that are NOT completed or rejected
            Task.objects.filter(
                task_workflow=workflow,
                task_stage=stage_name
            ).exclude(
                task_status__in=['completed', 'rejected']
            ).update(task_assigned_to_id=new_user_id)

        # Update assigned users and sync active tasks
        if 'author' in request.data:
            workflow.author_id = request.data['author']
            updated_fields.append('author')
            update_task_assignment('draft', request.data['author'])
            
        if 'reviewer' in request.data:
            workflow.reviewer_id = request.data['reviewer']
            updated_fields.append('reviewer')
            update_task_assignment('review', request.data['reviewer'])
            
        if 'approver' in request.data:
            workflow.approver_id = request.data['approver']
            updated_fields.append('approver')
            update_task_assignment('approval', request.data['approver'])
            
        if 'publisher' in request.data:
            workflow.publisher_id = request.data['publisher']
            updated_fields.append('publisher')
            update_task_assignment('publication', request.data['publisher'])
        
        if updated_fields:
            workflow.save(update_fields=updated_fields)
            
            # Log action
            UserActionLog.objects.create(
                user=request.user,
                action='reassign_workflow_users',
                content_type=ContentType.objects.get_for_model(Workflow),
                object_id=workflow.id,
                extra_info={'updated_fields': updated_fields}
            )
        
        return Response(self.get_serializer(workflow).data)
    
    def _send_notification(self, workflow, recipient, notification_type, subject, message):
        """Send email and log notification"""
        if not recipient or not recipient.email:
            logger.warning(f"Cannot send notification: recipient {recipient} has no email")
            return
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                fail_silently=False,
            )
            
            WorkflowNotification.objects.create(
                workflow=workflow,
                recipient=recipient,
                notification_type=notification_type,
                subject=subject,
                message=message,
                email_status='sent'
            )
            
            logger.info(f"Notification sent to {recipient.email} for workflow {workflow.id}")
        except Exception as e:
            logger.error(f"Failed to send email to {recipient.email}: {str(e)}")
            WorkflowNotification.objects.create(
                workflow=workflow,
                recipient=recipient,
                notification_type=notification_type,
                subject=subject,
                message=message,
                email_status='failed'
            )
    
    def _build_email_message(self, workflow, action, recipient_name, reason=None):
        """Build formatted email message with safe attribute access"""
        
        # Helper to safely get user name
        def get_user_name(user):
            if not user:
                return "Unknown User"
            return user.get_full_name() or user.username

        author_name = get_user_name(workflow.author)
        reviewer_name = get_user_name(workflow.reviewer)
        approver_name = get_user_name(workflow.approver)
        publisher_name = get_user_name(workflow.publisher)
        creator_name = get_user_name(workflow.created_by)

        messages = {
            'created': f"""
Hello {recipient_name},

A new workflow has been initialized and assigned to you:

Document: {workflow.document.doc_title}
Workflow: {workflow.nom}
Role: Author (Draft Creation)
Created by: {creator_name}

You have a pending task to upload/write the draft for this document.
Please log in to the system to begin.

Best regards,
Document Management System
            """,
            'review': f"""
Hello {recipient_name},

A new document has been submitted for your review:

Document: {workflow.document.doc_title}
Workflow: {workflow.nom}
Submitted by: {author_name}
Submitted on: {workflow.submitted_at.strftime('%Y-%m-%d %H:%M') if workflow.submitted_at else 'N/A'}

Please review this document at your earliest convenience.

Best regards,
Document Management System
            """,
            'rejected': f"""
Hello {recipient_name},

Your document has been rejected during the review process:

Document: {workflow.document.doc_title}
Workflow: {workflow.nom}
Reason: {reason or 'No reason provided'}

Please make the necessary corrections and resubmit.

Best regards,
Document Management System
            """,
            'approve': f"""
Hello {recipient_name},

A document has passed review and requires your approval:

Document: {workflow.document.doc_title}
Workflow: {workflow.nom}
Reviewed by: {reviewer_name}
Reviewed on: {workflow.reviewed_at.strftime('%Y-%m-%d %H:%M') if workflow.reviewed_at else 'N/A'}

Please review and approve this document.

Best regards,
Document Management System
            """,
            'publish': f"""
Hello {recipient_name},

A document has been approved and is ready for publication:

Document: {workflow.document.doc_title}
Workflow: {workflow.nom}
Approved by: {approver_name}
Approved on: {workflow.approved_at.strftime('%Y-%m-%d %H:%M') if workflow.approved_at else 'N/A'}

Please publish this document to make it available to all users.

Best regards,
Document Management System
            """,
            'published': f"""
Hello {recipient_name},

A document has been published and is now effective:

Document: {workflow.document.doc_title}
Workflow: {workflow.nom}
Published by: {publisher_name}
Published on: {workflow.published_at.strftime('%Y-%m-%d %H:%M') if workflow.published_at else 'N/A'}

The document is now locked as immutable and available to all authorized users.

Best regards,
Document Management System
            """
        }
        
        return messages.get(action, f"Update on workflow: {workflow.nom}")
    
    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing workflow tasks with visibility control
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['task_workflow', 'task_assigned_to', 'task_stage', 'task_status', 'task_priorite']
    search_fields = ['task_name', 'notes']
    ordering_fields = ['task_date_echeance', 'created_at', 'task_priorite']
    ordering = ['task_date_echeance']
    
    def get_queryset(self):
        """Users only see their own visible tasks"""
        user = self.request.user
        qs = super().get_queryset().select_related(
            'task_workflow', 
            'task_workflow__document',
            'task_assigned_to',
            'completed_by'
        )
        
        # Admins see all tasks
        if user.is_superuser or user.is_staff:
            return qs
        
        # Regular users see only their assigned visible tasks
        return qs.filter(
            task_assigned_to=user,
            is_visible=True
        )
    
    # ✅ NEW ENDPOINT: Get all tasks for current user
    @action(detail=False, methods=['get'], url_path='my-tasks')
    def my_tasks(self, request):
        """
        Get all tasks assigned to the current user across all workflows.
        Returns visible tasks with workflow information.
        """
        user = request.user
        
        # Get all visible tasks assigned to current user
        tasks = Task.objects.filter(
            task_assigned_to=user,
            is_visible=True
        ).select_related(
            'task_workflow',
            'task_workflow__document',
            'task_workflow__author',
            'task_workflow__reviewer',
            'task_workflow__approver',
            'task_workflow__publisher',
            'task_assigned_to',
            'completed_by'
        ).order_by('-created_at')
        
        # Paginate results
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='my-pending')
    def my_pending(self, request):
        """Dashboard: user's pending visible tasks"""
        tasks = self.get_queryset().filter(
            task_status__in=['pending', 'in_progress']
        ).order_by('task_date_echeance')
        
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        """Get overdue tasks"""
        tasks = self.get_queryset().filter(
            task_date_echeance__lt=timezone.now(),
            task_status__in=['pending', 'in_progress']
        ).order_by('task_date_echeance')
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark task as completed"""
        task = self.get_object()
        
        if task.task_status == 'completed':
            return Response(
                {'error': 'Task already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not task.is_visible:
            return Response(
                {'error': 'Task is locked'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.user != task.task_assigned_to and not request.user.is_superuser:
            return Response(
                {'error': 'Can only complete your own tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        task.task_status = 'completed'
        task.completed_at = timezone.now()
        task.completed_by = request.user
        task.notes = request.data.get('notes', task.notes)
        task.save(update_fields=['task_status', 'completed_at', 'completed_by', 'notes'])
        
        return Response(self.get_serializer(task).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject task (admin only)"""
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {'error': 'Admin only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        task = self.get_object()
        task.task_status = 'rejected'
        task.rejection_reason = request.data.get('reason', '')
        task.notes = request.data.get('notes', task.notes)
        task.save(update_fields=['task_status', 'rejection_reason', 'notes'])
        
        return Response(self.get_serializer(task).data)
    
    @action(detail=False, methods=['post'], url_path='bulk-update')
    def bulk_update(self, request):
        """Bulk update task statuses (admin only)"""
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {'error': 'Admin only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TaskBulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        task_ids = serializer.validated_data['task_ids']
        new_status = serializer.validated_data['task_status']
        notes = serializer.validated_data.get('notes', '')
        
        updated_count = Task.objects.filter(id__in=task_ids).update(
            task_status=new_status,
            notes=notes
        )
        
        return Response({
            'updated_count': updated_count,
            'task_ids': task_ids,
            'new_status': new_status
        })


class WorkflowStageViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for workflow stages"""
    queryset = WorkflowStage.objects.all()
    serializer_class = WorkflowStageSerializer
    permission_classes = [IsAuthenticated]


class ElectronicSignatureViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for electronic signatures (audit trail)"""
    queryset = ElectronicSignature.objects.all()
    serializer_class = ElectronicSignatureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['workflow', 'signed_by', 'stage']
    ordering_fields = ['signed_at']
    ordering = ['-signed_at']
    
    def get_queryset(self):
        """Filter signatures based on user permissions"""
        qs = super().get_queryset().select_related('workflow', 'signed_by')
        user = self.request.user
        
        # Admins see all signatures
        if user.is_superuser or user.is_staff:
            return qs
        
        # Regular users see only signatures from workflows they're involved in
        return qs.filter(
            Q(workflow__author=user) |
            Q(workflow__reviewer=user) |
            Q(workflow__approver=user) |
            Q(workflow__publisher=user)
        ).distinct()
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify signature hash integrity"""
        signature = self.get_object()
        
        # In production, implement actual cryptographic verification
        # For now, just confirm the signature exists
        is_valid = bool(signature.signature_hash)
        
        return Response({
            'valid': is_valid,
            'signature_hash': signature.signature_hash,
            'signed_by': signature.signed_by.username,
            'signed_at': signature.signed_at,
            'workflow_id': signature.workflow.id
        })


class WorkflowNotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for workflow notifications"""
    queryset = WorkflowNotification.objects.all()
    serializer_class = WorkflowNotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['workflow', 'recipient', 'notification_type', 'email_status']
    ordering_fields = ['sent_at']
    ordering = ['-sent_at']
    
    def get_queryset(self):
        """Users see only their own notifications unless admin"""
        qs = super().get_queryset().select_related('workflow', 'recipient')
        
        if self.request.user.is_superuser or self.request.user.is_staff:
            return qs
        
        return qs.filter(recipient=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications for current user"""
        notifications = self.get_queryset().filter(read_at__isnull=True)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.read_at = timezone.now()
        notification.save(update_fields=['read_at'])
        return Response({'status': 'marked_as_read', 'read_at': notification.read_at})


class MyTasksDashboardView(APIView):
    """Dashboard view showing current user's task summary"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get visible tasks for current user
        tasks = Task.objects.filter(
            task_assigned_to=user,
            is_visible=True
        ).exclude(task_status='completed').select_related(
            'task_workflow',
            'task_workflow__document'
        )
        
        # Group by stage
        dashboard = {
            'total_pending': tasks.count(),
            'by_stage': {
                'draft': tasks.filter(task_stage='draft').count(),
                'review': tasks.filter(task_stage='review').count(),
                'approval': tasks.filter(task_stage='approval').count(),
                'publication': tasks.filter(task_stage='publication').count(),
            },
            'by_priority': {
                'urgent': tasks.filter(task_priorite='urgent').count(),
                'high': tasks.filter(task_priorite='high').count(),
                'normal': tasks.filter(task_priorite='normal').count(),
                'low': tasks.filter(task_priorite='low').count(),
            },
            'overdue': tasks.filter(task_date_echeance__lt=timezone.now()).count(),
            'tasks': TaskSerializer(
                tasks.order_by('task_date_echeance')[:10],
                many=True,
                context={'request': request}
            ).data,
        }
        
        return Response(dashboard)


class WorkflowStatisticsView(APIView):
    """Workflow statistics and metrics (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        from datetime import timedelta
        
        total_workflows = Workflow.objects.count()
        
        # Calculate average completion time for published workflows
        published = Workflow.objects.filter(
            status='published',
            published_at__isnull=False,
            created_at__isnull=False
        )
        
        avg_completion = None
        if published.exists():
            completion_times = [
                (w.published_at - w.created_at).total_seconds() / 86400  # Convert to days
                for w in published
            ]
            avg_completion = sum(completion_times) / len(completion_times)
        
        stats = {
            'total_workflows': total_workflows,
            'by_status': {
                'draft': Workflow.objects.filter(status='draft').count(),
                'in_review': Workflow.objects.filter(status='in_review').count(),
                'pending_approval': Workflow.objects.filter(status='pending_approval').count(),
                'approved': Workflow.objects.filter(status='approved').count(),
                'published': Workflow.objects.filter(status='published').count(),
                'rejected': Workflow.objects.filter(status='rejected').count(),
            },
            'recent_activity': {
                'last_7_days': Workflow.objects.filter(
                    created_at__gte=timezone.now() - timedelta(days=7)
                ).count(),
                'last_30_days': Workflow.objects.filter(
                    created_at__gte=timezone.now() - timedelta(days=30)
                ).count(),
            },
            'average_completion_time_days': round(avg_completion, 2) if avg_completion else None,
            'total_signatures': ElectronicSignature.objects.count(),
            'total_tasks': Task.objects.count(),
            'completed_tasks': Task.objects.filter(task_status='completed').count(),
            'overdue_tasks': Task.objects.filter(
                task_date_echeance__lt=timezone.now(),
                task_status__in=['pending', 'in_progress']
            ).count(),
        }
        
        return Response(stats)