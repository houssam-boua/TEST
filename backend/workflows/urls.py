from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkflowViewSet,
    TaskViewSet,
    WorkflowStageViewSet,
    ElectronicSignatureViewSet,
    WorkflowNotificationViewSet,
    MyTasksDashboardView,
    WorkflowStatisticsView,
    workflows_by_state,
)

# Router for ViewSets
router = DefaultRouter()
router.register(r"workflows", WorkflowViewSet, basename="workflow")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"stages", WorkflowStageViewSet, basename="workflow-stage")
router.register(r"signatures", ElectronicSignatureViewSet, basename="signature")
router.register(r"notifications", WorkflowNotificationViewSet, basename="notification")

# Additional URL patterns for custom views
urlpatterns = [
    # Router-generated URLs (includes all ViewSet actions and custom @action endpoints)
    path("", include(router.urls)),
    
    # Dashboard and statistics
     path("dashboard/workflows/by-state/", workflows_by_state, name="workflows-by-state"),
    path("my-tasks/", MyTasksDashboardView.as_view(), name="my-tasks"),
    path("statistics/", WorkflowStatisticsView.as_view(), name="workflow-statistics"),
]

# ============================================================================
# AUTO-GENERATED ENDPOINTS (via DefaultRouter + @action decorators):
# ============================================================================
#
# WORKFLOW ENDPOINTS:
# -------------------
# GET    /api/workflows/                          - List all workflows
# POST   /api/workflows/                          - Create new workflow
# GET    /api/workflows/{id}/                     - Retrieve workflow details
# PUT    /api/workflows/{id}/                     - Update workflow
# PATCH  /api/workflows/{id}/                     - Partial update workflow
# DELETE /api/workflows/{id}/                     - Delete workflow
#
# WORKFLOW ACTIONS (GED Lifecycle):
# ---------------------------------
# POST   /api/workflows/{id}/submit-for-review/   - Step 1: Author submits draft
# POST   /api/workflows/{id}/validate-review/     - Step 2: Reviewer validates/rejects
# POST   /api/workflows/{id}/approve-sign/        - Step 3: Approver signs electronically
# POST   /api/workflows/{id}/publish/             - Step 4: Publisher releases document
# GET    /api/workflows/{id}/history/             - View workflow audit history
# GET    /api/workflows/{id}/signatures/          - View all signatures for workflow
# GET    /api/workflows/{id}/notifications/       - View all notifications for workflow
# POST   /api/workflows/{id}/assign-users/        - Admin: reassign workflow users
# GET    /api/workflows/my-workflows/             - Current user's workflows
# GET    /api/workflows/pending-action/           - Workflows requiring user action
#
# TASK ENDPOINTS:
# ---------------
# GET    /api/tasks/                              - List all tasks (filtered by visibility)
# POST   /api/tasks/                              - Create new task
# GET    /api/tasks/{id}/                         - Retrieve task details
# PUT    /api/tasks/{id}/                         - Update task
# PATCH  /api/tasks/{id}/                         - Partial update task
# DELETE /api/tasks/{id}/                         - Delete task
#
# TASK ACTIONS:
# -------------
# GET    /api/tasks/my-pending/                   - Current user's visible pending tasks
# POST   /api/tasks/{id}/complete/                - Mark task as completed
# POST   /api/tasks/{id}/reject/                  - Reject task (send back to previous stage)
# POST   /api/tasks/bulk-update/                  - Bulk update task statuses
# GET    /api/tasks/overdue/                      - List overdue tasks
# GET    /api/tasks/?workflow={id}                - Filter tasks by workflow
# GET    /api/tasks/?assigned_to={user_id}        - Filter tasks by assigned user
# GET    /api/tasks/?stage={stage}                - Filter tasks by workflow stage
#
# WORKFLOW STAGE ENDPOINTS:
# -------------------------
# GET    /api/stages/                             - List all workflow stages
# GET    /api/stages/{id}/                        - Retrieve stage details
#
# ELECTRONIC SIGNATURE ENDPOINTS:
# -------------------------------
# GET    /api/signatures/                         - List all signatures (admin only)
# GET    /api/signatures/{id}/                    - Retrieve signature details
# GET    /api/signatures/?workflow={id}           - Filter signatures by workflow
# POST   /api/signatures/{id}/verify/             - Verify signature hash integrity
#
# NOTIFICATION ENDPOINTS:
# -----------------------
# GET    /api/notifications/                      - List all notifications
# GET    /api/notifications/{id}/                 - Retrieve notification details
# PATCH  /api/notifications/{id}/mark-read/       - Mark notification as read
# GET    /api/notifications/unread/               - Current user's unread notifications
# GET    /api/notifications/?workflow={id}        - Filter notifications by workflow
#
# DASHBOARD & STATISTICS:
# -----------------------
# GET    /api/my-tasks/                           - Current user's task dashboard
# GET    /api/statistics/                         - Workflow statistics and metrics
#
# ============================================================================

# EXAMPLE API CALLS:
# ==================
#
# 1. CREATE WORKFLOW (Admin assigns users to stages):
# POST /api/workflows/
# {
#   "nom": "Quality Procedure Review",
#   "description": "IATF 16949 compliance review",
#   "document": 123,
#   "author": 5,
#   "reviewer": 8,
#   "approver": 12,
#   "publisher": 3
# }
#
# 2. AUTHOR SUBMITS FOR REVIEW:
# POST /api/workflows/45/submit-for-review/
# {}
#
# 3. REVIEWER VALIDATES:
# POST /api/workflows/45/validate-review/
# {
#   "action": "pass",
#   "notes": "Content approved for next stage"
# }
#
# 4. REVIEWER REJECTS:
# POST /api/workflows/45/validate-review/
# {
#   "action": "reject",
#   "reason": "Missing compliance references",
#   "notes": "Please add ISO 9001 section references"
# }
#
# 5. APPROVER SIGNS:
# POST /api/workflows/45/approve-sign/
# {}
# Response: {"status": "approved", "signature": "abc123..."}
#
# 6. PUBLISHER RELEASES:
# POST /api/workflows/45/publish/
# {}
#
# 7. GET MY PENDING TASKS (Sequential visibility enforced):
# GET /api/tasks/my-pending/
# Response: [
#   {
#     "id": 78,
#     "task_name": "Review Document",
#     "is_visible": true,
#     "task_stage": "review",
#     ...
#   }
# ]
#
# 8. GET WORKFLOW WITH FULL DETAILS:
# GET /api/workflows/45/?detail=full
# Response includes: tasks, signatures, notifications, timeline
#
# ============================================================================
