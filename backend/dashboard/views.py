from datetime import datetime, timedelta
from django.core.cache import cache
from typing import List, Dict, Any, Optional
import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, F
from django.utils import timezone

# Ensure you have these imports for your models
from documents.models import Document
from users.models import User, Departement
from workflows.models import Workflow, Task

logger = logging.getLogger(__name__)

CACHE_TIMEOUT = 60

# Trend period: compare "current" vs "snapshot taken ~24h ago"
TREND_PERIOD_SECONDS = 60 * 60 * 24  # 24h

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    # -----------------------------
    # ✅ MAIN ENDPOINT (With Fix for Task Counts)
    # -----------------------------
    def get(self, request):
        """
        Main aggregated dashboard endpoint.
        Handles GET /api/dashboard/
        """
        current_user = request.user

        # ---------------------------------------------------------
        # 1. Filter Tasks
        # ---------------------------------------------------------
        # We filter by:
        # A) task_assigned_to = current_user (Your tasks)
        # B) is_visible = True (Only tasks that have been "unlocked" by the workflow)
        base_qs = Task.objects.filter(
            task_assigned_to=current_user, 
            is_visible=True
        )

        # Count total ACTIVE tasks (Pending + In Progress)
        # We exclude 'completed' and 'rejected' to show what is still to be done.
        pending_tasks = base_qs.exclude(
            task_status__in=['completed', 'rejected']
        ).count()
        
        # Count Overdue tasks (Visible + Past Deadline + Not Done)
        overdue_tasks = base_qs.filter(
            task_date_echeance__lt=timezone.now()
        ).exclude(
            task_status__in=['completed', 'rejected']
        ).count()

        total_tasks = base_qs.count()

        # ---------------------------------------------------------
        # 2. Get other stats (Documents, Workflows, etc.)
        # ---------------------------------------------------------
        # Using use_cache=True for better performance
        doc_count_payload = self.get_documents_count(use_cache=True)
        wf_count_payload = self.get_workflows_count(use_cache=True)

        return Response({
            "data": {
                # Task Stats
                "pending_tasks": pending_tasks,
                "overdue_tasks": overdue_tasks,
                "total_tasks": total_tasks,
                
                # Document Stats
                "totalDocuments": doc_count_payload.get("count", 0),
                "documentTrend": doc_count_payload.get("trend"),

                # Workflow Stats
                "totalWorkflows": wf_count_payload.get("count", 0),
                "workflowTrend": wf_count_payload.get("trend"),
            },
            "message": "Dashboard stats retrieved successfully."
        }, status=status.HTTP_200_OK)

    # -----------------------------
    # Trend helpers
    # -----------------------------
    @staticmethod
    def _prev_count_key(base_key: str) -> str:
        return f"{base_key}:previous_count"

    @staticmethod
    def _prev_ts_key(base_key: str) -> str:
        return f"{base_key}:previous_ts"

    @staticmethod
    def _now_ts() -> int:
        return int(datetime.utcnow().timestamp())

    @staticmethod
    def _maybe_rotate_previous(base_key: str, current_count: int) -> None:
        """
        Maintain a 'previous_count' snapshot roughly once per TREND_PERIOD_SECONDS.
        """
        prev_ts = cache.get(DashboardView._prev_ts_key(base_key))
        prev_count = cache.get(DashboardView._prev_count_key(base_key))

        now_ts = DashboardView._now_ts()

        if prev_ts is None or prev_count is None:
            cache.set(DashboardView._prev_count_key(base_key), current_count, TREND_PERIOD_SECONDS)
            cache.set(DashboardView._prev_ts_key(base_key), now_ts, TREND_PERIOD_SECONDS)
            return

        age = now_ts - int(prev_ts)
        if age >= TREND_PERIOD_SECONDS:
            cache.set(DashboardView._prev_count_key(base_key), current_count, TREND_PERIOD_SECONDS)
            cache.set(DashboardView._prev_ts_key(base_key), now_ts, TREND_PERIOD_SECONDS)

    @staticmethod
    def _build_trend_payload(base_key: str, current_count: int) -> Dict[str, Any]:
        """
        Return trend payload structure.
        """
        DashboardView._maybe_rotate_previous(base_key, current_count)
        prev_count = cache.get(DashboardView._prev_count_key(base_key))
        
        if prev_count is None:
            return {"count": current_count, "previous_count": None, "trend": None}

        try:
            prev_count_int = int(prev_count)
        except (TypeError, ValueError):
            return {"count": current_count, "previous_count": None, "trend": None}

        if prev_count_int <= 0:
            return {"count": current_count, "previous_count": prev_count_int, "trend": None}

        change = current_count - prev_count_int
        percentage = round((change / prev_count_int) * 100.0, 1)

        trend = {
            "percentage": abs(percentage),
            "direction": "up" if change >= 0 else "down",
        }

        return {
            "count": current_count,
            "previous_count": prev_count_int,
            "trend": trend,
        }

    # -----------------------------
    # Counts (with trend)
    # -----------------------------
    @staticmethod
    def get_documents_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> Dict[str, Any]:
        cache_key = "dashboard_documents_count"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None: return cached
            
        count = Document.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)
        
        if use_cache: cache.set(cache_key, payload, timeout)
        return payload

    @staticmethod
    def get_users_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> Dict[str, Any]:
        cache_key = "dashboard_users_count"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None: return cached
            
        count = User.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)
        
        if use_cache: cache.set(cache_key, payload, timeout)
        return payload

    @staticmethod
    def get_departements_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> Dict[str, Any]:
        cache_key = "dashboard_departements_count"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None: return cached
            
        count = Departement.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)
        
        if use_cache: cache.set(cache_key, payload, timeout)
        return payload

    @staticmethod
    def get_workflows_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> Dict[str, Any]:
        cache_key = "dashboard_workflows_count"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None: return cached
            
        count = Workflow.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)
        
        if use_cache: cache.set(cache_key, payload, timeout)
        return payload

    # -----------------------------
    # Other widgets
    # -----------------------------
    @staticmethod
    def get_documents_by_status_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> List[Dict[str, Any]]:
        """
        Return number of documents by status.
        """
        if use_cache:
            cached = cache.get("dashboard_documents_by_status_count")
            if cached is not None: return cached
            
        qs = (
            Document.objects.values("doc_status_type")
            .annotate(count=Count("id"))
            .order_by("doc_status_type")
        )
        data = list(qs)
        
        if use_cache: cache.set("dashboard_documents_by_status_count", data, timeout)
        return data

    @staticmethod
    def get_documents_by_departement_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> List[Dict[str, Any]]:
        """
        Return number of documents by department.
        """
        if use_cache:
            cached = cache.get("dashboard_documents_by_departement_count")
            if cached is not None: return cached
            
        qs = (
            Document.objects.values(dep_name=F("doc_departement__dep_name"))
            .annotate(count=Count("id"))
            .order_by("dep_name")
        )
        data = list(qs)
        
        if use_cache: cache.set("dashboard_documents_by_departement_count", data, timeout)
        return data

    @staticmethod
    def get_recent_documents(limit: int = 5) -> List[Dict[str, Any]]:
        """
        Return a list of recent documents as dicts.
        """
        qs = (
            Document.objects.select_related("doc_owner", "doc_departement", "parent_folder")
            .order_by("-id")[:limit]
        )

        results: List[Dict[str, Any]] = []

        for d in qs:
            results.append({
                "id": d.id,
                "title": d.doc_title or "",
                "type": d.doc_type or d.doc_format or "",
                "owner": d.doc_owner.username if d.doc_owner else None,
                "status": d.doc_status_type or "",
                "created_at": d.created_at,
                "departement": d.doc_departement.dep_name if d.doc_departement else None,
            })
        return results

    @staticmethod
    def get_workflows_by_state() -> List[Dict[str, Any]]:
        """
        Maps DB 'status' to Frontend 'etat' labels.
        """
        STATUS_MAP = {
            'draft': 'Élaboration',
            'in_review': 'Vérification',
            'pending_approval': 'Approbation',
            'approved': 'Approbation',
            'published': 'Diffusion',
        }
        
        db_stats = Workflow.objects.values("status").annotate(count=Count("id"))
        counts_lookup = {item['status']: item['count'] for item in db_stats}
        frontend_states = ['Élaboration', 'Vérification', 'Approbation', 'Diffusion']
        results = []

        for label in frontend_states:
            matching_db_statuses = [k for k, v in STATUS_MAP.items() if v == label]
            total_count = sum(counts_lookup.get(s, 0) for s in matching_db_statuses)
            
            workflows = (
                Workflow.objects.filter(status__in=matching_db_statuses)
                .select_related("document")
                .order_by("-updated_at")[:5]
            )

            workflows_data = []
            for wf in workflows:
                workflows_data.append({
                    "id": wf.id,
                    "nom": wf.nom,
                    "etat": label,
                    "status": wf.status,
                    "document": {
                        "id": wf.document.id if wf.document else None,
                        "title": wf.document.doc_title if wf.document else "Sans titre",
                    }
                })

            results.append({
                "etat": label,
                "count": total_count,
                "workflows": workflows_data,
            })
        return results

    @staticmethod
    def get_validators_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
        if use_cache:
            cached = cache.get("dashboard_validators_count")
            if cached is not None: return cached
            
        count = User.objects.filter(is_staff=True).count()
        
        if use_cache: cache.set("dashboard_validators_count", count, timeout)
        return count


def invalidate_dashboard_cache():
    """
    Helper to invalidate dashboard-related caches + trend snapshots.
    """
    cache.delete_many([
        "dashboard_documents_count", 
        "dashboard_users_count", 
        "dashboard_departements_count", 
        "dashboard_workflows_count",
        "dashboard_documents_count:previous_count", "dashboard_documents_count:previous_ts",
        "dashboard_users_count:previous_count", "dashboard_users_count:previous_ts",
        "dashboard_departements_count:previous_count", "dashboard_departements_count:previous_ts",
        "dashboard_workflows_count:previous_count", "dashboard_workflows_count:previous_ts",
        "dashboard_documents_by_status_count", 
        "dashboard_documents_by_departement_count",
        "dashboard_validators_count",
    ])