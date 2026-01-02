from django.urls import path

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .views import DashboardView, invalidate_dashboard_cache


@api_view(['GET'])
def documents_count(request):
    count = DashboardView.get_documents_count()
    return Response({"data": count, "message": "Total document count retrieved successfully."}, status=200)


@api_view(['GET'])
def documents_by_status(request):
    counts = DashboardView.get_documents_by_status_count()
    return Response({"data": counts, "message": "Document count by status retrieved successfully."}, status=200)


@api_view(['GET'])
def documents_by_departement(request):
    counts = DashboardView.get_documents_by_departement_count()
    return Response({"data": counts, "message": "Document count by department retrieved successfully."}, status=200)


@api_view(['GET'])
def recent_documents(request):
    try:
        limit = int(request.query_params.get('limit', 5))
    except (TypeError, ValueError):
        limit = 5

    results = DashboardView.get_recent_documents(limit=limit)
    return Response({'data': results, 'message': 'Recent documents retrieved successfully.'}, status=200)


@api_view(['GET'])
def workflows_by_state(request):
    """
    Return workflows grouped by state (etat) with their documents.
    """
    results = DashboardView.get_workflows_by_state()
    return Response({'data': results, 'message': 'Workflows by state retrieved successfully.'}, status=200)


@api_view(['GET'])
def validators_count(request):
    count = DashboardView.get_validators_count()
    return Response({'data': count, 'message': 'Total validators count retrieved successfully.'}, status=200)


@api_view(['GET'])
def users_count(request):
    count = DashboardView.get_users_count()
    return Response({'data': count, 'message': 'Total users count retrieved successfully.'}, status=200)


@api_view(['GET'])
def departements_count(request):
    count = DashboardView.get_departements_count()
    return Response({'data': count, 'message': 'Total departments count retrieved successfully.'}, status=200)


@api_view(['GET'])
def workflows_count(request):
    count = DashboardView.get_workflows_count()
    return Response({'data': count, 'message': 'Total workflows count retrieved successfully.'}, status=200)


@api_view(['POST'])
def invalidate_cache(request):
    invalidate_dashboard_cache()
    return Response({'status': 'ok'})


urlpatterns = [
    path('dashboard/documents/count/', documents_count, name='dashboard-documents-count'),
    path('dashboard/documents/by-status/', documents_by_status, name='dashboard-documents-by-status'),
    path('dashboard/documents/by-departement/', documents_by_departement, name='dashboard-documents-by-departement'),
    path('dashboard/documents/recent/', recent_documents, name='dashboard-documents-recent'),
    path('dashboard/workflows/by-state/', workflows_by_state, name='dashboard-workflows-by-state'),
    path('dashboard/validators/count/', validators_count, name='dashboard-validators-count'),
    path('dashboard/users/count/', users_count, name='dashboard-users-count'),
    path('dashboard/departements/count/', departements_count, name='dashboard-departements-count'),
    path('dashboard/workflows/count/', workflows_count, name='dashboard-workflows-count'),
    path('dashboard/invalidate-cache/', invalidate_cache, name='dashboard-invalidate-cache'),
]
