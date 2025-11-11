from django.shortcuts import render
from django.core.cache import cache
from typing import List, Dict, Any
from rest_framework.views import APIView
from rest_framework.response import Response

from documents.models import Document
from users.models import User, Role, Departement
from workflows.models import Workflow
from django.db.models import Count, F

# Default cache timeout (seconds)
CACHE_TIMEOUT = 60


class DashboardView(APIView):
    def get_documents_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
        """
        Return total number of documents. Cached by default.
        """
        if use_cache:
            cached = cache.get("dashboard_documents_count")
            if cached is not None:
                return cached
        count = Document.objects.count()
        if use_cache:
            cache.set("dashboard_documents_count", count, timeout)
        return count

    def get_documents_by_status_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> Dict[str, int]:
        """
        Return number of documents by status.
        """
        if use_cache:
            cached = cache.get("dashboard_documents_by_status_count")
            if cached is not None:
                return cached
            
        status_counts = Document.objects.values('doc_status').annotate(count=Count('id')).order_by('doc_status')
        if use_cache:
            cache.set("dashboard_documents_by_status_count", status_counts, timeout)
        return status_counts

    def get_documents_by_departement_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> Dict[str, int]:
        """
        Return number of documents by department.
        """
        if use_cache:
            cached = cache.get("dashboard_documents_by_departement_count")
            if cached is not None:
                return cached

        departement_counts = Document.objects.values(dep_name=F('doc_departement__dep_name')).annotate(count=Count('id')).order_by('dep_name')
        if use_cache:
            cache.set("dashboard_documents_by_departement_count", departement_counts, timeout)
        return departement_counts

    def get_recent_documents(limit: int = 5) -> List[Dict[str, Any]]:
        """
        Return a simple list of recent documents as dicts.
        Uses `-id` ordering to avoid depending on a timestamp field.
        """
        qs = Document.objects.select_related("doc_owner", "doc_departement").order_by("-id")[:limit]
        results: List[Dict[str, Any]] = []
        for d in qs:
            results.append({
                "id": d.id,
                "title": getattr(d, "doc_title", ""),
                "status": getattr(d, "doc_status", ""),
                "towner": getattr(d.doc_owner, "username", None) if getattr(d, "doc_owner", None) else None,
                "departement": getattr(d.doc_departement, "dep_name", None) if getattr(d, "doc_departement", None) else None,
                "path": getattr(getattr(d, "doc_path", None), "name", None),
                "created_at": getattr(d, "created_at", None),
            })
        return results

    def get_validators_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
        """
        Return total number of users with 'validator' role. Cached by default.
        """
        if use_cache:
            cached = cache.get("dashboard_validators_count")
            if cached is not None:
                return cached
        count = User.objects.filter(roles__name='validator').distinct().count()
        if use_cache:
            cache.set("dashboard_validators_count", count, timeout)
        return count

    def get_users_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
        """
        Return total number of users. Cached by default.
        """
        if use_cache:
            cached = cache.get("dashboard_users_count")
            if cached is not None:
                return cached
        count = User.objects.count()
        if use_cache:
            cache.set("dashboard_users_count", count, timeout)
        return count

    def get_departements_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
        """
        Return total number of departments. Cached by default.
        """
        if use_cache:
            cached = cache.get("dashboard_departements_count")
            if cached is not None:
                return cached
        count = Departement.objects.count()
        if use_cache:
            cache.set("dashboard_departements_count", count, timeout)
        return count

    # def get_roles_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
    #     """
    #     Return total number of roles. Cached by default.
    #     """
    #     if use_cache:
    #         cached = cache.get("dashboard_roles_count")
    #         if cached is not None:
    #             return cached
    #     count = Role.objects.count()
    #     if use_cache:
    #         cache.set("dashboard_roles_count", count, timeout)
    #     return count
    
    def get_workflow_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
        """
        Return total number of workflows. Cached by default.
        """
        if use_cache:
            cached = cache.get("dashboard_workflows_count")
            if cached is not None:
                return cached
        count = Workflow.objects.count()
        if use_cache:
            cache.set("dashboard_workflows_count", count, timeout)
        return count
    
def invalidate_dashboard_cache():
    """
    Helper to invalidate dashboard-related caches. Call this from relevant signals
    (e.g. post_save/post_delete for Document and User role changes).
    """
    cache.delete_many([
        "dashboard_documents_count",
        "dashboard_documents_by_status_count",
        "dashboard_documents_by_departement_count",
        "dashboard_validators_count",
        "dashboard_users_count"
    ])