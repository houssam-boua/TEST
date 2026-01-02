from datetime import datetime, timedelta
from django.core.cache import cache
from typing import List, Dict, Any, Optional, Union

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view

from documents.models import Document
from users.models import User, Departement
from workflows.models import Workflow
from django.db.models import Count, F, Prefetch


CACHE_TIMEOUT = 60

# Trend period: compare "current" vs "snapshot taken ~24h ago"
TREND_PERIOD_SECONDS = 60 * 60 * 24  # 24h


class DashboardView(APIView):
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
        - If there is no previous snapshot -> set it now.
        - If snapshot exists but is old -> rotate it to current_count.
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
        Return:
          {
            "count": <int>,
            "previous_count": <int|null>,
            "trend": { "percentage": <float>, "direction": "up"|"down" } | None
          }
        """
        # Ensure previous snapshot exists / rotates if too old
        DashboardView._maybe_rotate_previous(base_key, current_count)

        prev_count = cache.get(DashboardView._prev_count_key(base_key))
        if prev_count is None:
            return {"count": current_count, "previous_count": None, "trend": None}

        try:
            prev_count_int = int(prev_count)
        except (TypeError, ValueError):
            return {"count": current_count, "previous_count": None, "trend": None}

        # Avoid division by zero
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
            if cached is not None:
                return cached

        count = Document.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)

        if use_cache:
            cache.set(cache_key, payload, timeout)

        return payload

    @staticmethod
    def get_users_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> Dict[str, Any]:
        cache_key = "dashboard_users_count"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None:
                return cached

        count = User.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)

        if use_cache:
            cache.set(cache_key, payload, timeout)

        return payload

    @staticmethod
    def get_departements_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> Dict[str, Any]:
        cache_key = "dashboard_departements_count"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None:
                return cached

        count = Departement.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)

        if use_cache:
            cache.set(cache_key, payload, timeout)

        return payload

    @staticmethod
    def get_workflows_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> Dict[str, Any]:
        cache_key = "dashboard_workflows_count"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None:
                return cached

        count = Workflow.objects.count()
        payload = DashboardView._build_trend_payload(cache_key, count)

        if use_cache:
            cache.set(cache_key, payload, timeout)

        return payload

    # -----------------------------
    # Other widgets (unchanged)
    # -----------------------------
    @staticmethod
    def get_documents_by_status_count(
        use_cache: bool = True, timeout: int = CACHE_TIMEOUT
    ) -> List[Dict[str, Any]]:
        """
        Return number of documents by status.
        Uses doc_status_type field from Document model.
        """
        if use_cache:
            cached = cache.get("dashboard_documents_by_status_count")
            if cached is not None:
                return cached

        qs = (
            Document.objects.values("doc_status_type")
            .annotate(count=Count("id"))
            .order_by("doc_status_type")
        )
        data = list(qs)

        if use_cache:
            cache.set("dashboard_documents_by_status_count", data, timeout)

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
            if cached is not None:
                return cached

        qs = (
            Document.objects.values(dep_name=F("doc_departement__dep_name"))
            .annotate(count=Count("id"))
            .order_by("dep_name")
        )
        data = list(qs)

        if use_cache:
            cache.set("dashboard_documents_by_departement_count", data, timeout)

        return data

    @staticmethod
    def get_recent_documents(limit: int = 5) -> List[Dict[str, Any]]:
        """
        Return a list of recent documents as dicts.
        Uses -id ordering to get most recent entries.
        Returns multiple field variants to support different frontend accessors.
        """
        qs = (
            Document.objects.select_related("doc_owner", "doc_departement", "parent_folder")
            .order_by("-id")[:limit]
        )

        results: List[Dict[str, Any]] = []

        for d in qs:
            owner_username: Optional[str] = (
                d.doc_owner.username if getattr(d, "doc_owner", None) else None
            )

            dept_name: Optional[str] = (
                d.doc_departement.dep_name if getattr(d, "doc_departement", None) else None
            )

            folder_id: Optional[int] = (
                d.parent_folder.id if getattr(d, "parent_folder", None) else None
            )

            folder_path: Optional[str] = (
                d.parent_folder.fol_path if getattr(d, "parent_folder", None) else None
            )

            file_path: Optional[str] = getattr(getattr(d, "doc_path", None), "name", None)

            # Pick a "type" value that will not be empty
            dtype = getattr(d, "doc_type", None) or getattr(d, "doc_format", None) or ""

            status_value = getattr(d, "doc_status_type", "")
            created_value = getattr(d, "created_at", None)

            results.append(
                {
                    "id": d.id,
                    "name": getattr(d, "doc_title", ""),
                    "title": getattr(d, "doc_title", ""),
                    "type": dtype,
                    "doc_type": getattr(d, "doc_type", ""),
                    "doc_format": getattr(d, "doc_format", ""),
                    "owner": owner_username,
                    "towner": owner_username,
                    "status": status_value,
                    "doc_status_type": status_value,
                    "createdAt": created_value,
                    "created_at": created_value,
                    "departement": dept_name,
                    "folderId": folder_id,
                    "folderPath": folder_path,
                    "filePath": file_path,
                }
            )

        return results

    @staticmethod
    def get_workflows_by_state() -> List[Dict[str, Any]]:
        """
        Return workflows grouped by state (etat) with their documents.
        Returns: [{ etat: 'Élaboration', count: 2, workflows: [...] }]
        """
        state_groups = (
            Workflow.objects.values("etat")
            .annotate(count=Count("id"))
            .order_by("etat")
        )

        result: List[Dict[str, Any]] = []
        for group in state_groups:
            etat = group["etat"]
            count = group["count"]

            workflows = (
                Workflow.objects.filter(etat=etat)
                .select_related("document")[:5]
            )

            workflows_data: List[Dict[str, Any]] = []
            for wf in workflows:
                if wf.document:
                    workflows_data.append(
                        {
                            "id": wf.id,
                            "nom": wf.nom,
                            "document": {
                                "id": wf.document.id,
                                "title": wf.document.doc_title,
                                "code": getattr(wf.document, "doc_code", None),
                            },
                        }
                    )

            result.append(
                {
                    "etat": etat,
                    "count": count,
                    "workflows": workflows_data,
                }
            )

        return result

    @staticmethod
    def get_validators_count(use_cache: bool = True, timeout: int = CACHE_TIMEOUT) -> int:
        """
        Return total number of users with 'validator' role. Cached by default.
        """
        if use_cache:
            cached = cache.get("dashboard_validators_count")
            if cached is not None:
                return cached

        count = User.objects.filter(roles__name="validator").distinct().count()

        if use_cache:
            cache.set("dashboard_validators_count", count, timeout)

        return count


def invalidate_dashboard_cache():
    """
    Helper to invalidate dashboard-related caches + trend snapshots.
    """
    cache.delete_many(
        [
            # main cached payloads
            "dashboard_documents_count",
            "dashboard_users_count",
            "dashboard_departements_count",
            "dashboard_workflows_count",

            # trend snapshot keys
            "dashboard_documents_count:previous_count",
            "dashboard_documents_count:previous_ts",
            "dashboard_users_count:previous_count",
            "dashboard_users_count:previous_ts",
            "dashboard_departements_count:previous_count",
            "dashboard_departements_count:previous_ts",
            "dashboard_workflows_count:previous_count",
            "dashboard_workflows_count:previous_ts",

            # other widgets
            "dashboard_documents_by_status_count",
            "dashboard_documents_by_departement_count",
            "dashboard_validators_count",
        ]
    )
