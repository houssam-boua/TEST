from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .views import DashboardView, invalidate_dashboard_cache

@api_view(['GET'])
def documents_count(request):
    count = DashboardView.get_documents_count()
    return Response({'count': count})

@api_view(['GET'])
def documents_by_status(request):
    counts = DashboardView.get_documents_by_status_count()
    return Response(counts)

@api_view(['GET'])
def documents_by_departement(request):
    counts = DashboardView.get_documents_by_departement_count()
    return Response(counts)

@api_view(['GET'])
def recent_documents(request):
    try:
        limit = int(request.query_params.get('limit', 5))
    except (TypeError, ValueError):
        limit = 5
    results = DashboardView.get_recent_documents(limit=limit)
    return Response({'results': results})

@api_view(['GET'])
def validators_count(request):
    count = DashboardView.get_validators_count()
    return Response({'count': count})

@api_view(['GET'])
def users_count(request):
    count = DashboardView.get_users_count()
    return Response({'count': count})

@api_view(['POST'])
def invalidate_cache(request):
    invalidate_dashboard_cache()
    return Response({'status': 'ok'})

urlpatterns = [
    path('dashboard/documents/count/', documents_count, name='dashboard-documents-count'),
    path('dashboard/documents/by-status/', documents_by_status, name='dashboard-documents-by-status'),
    path('dashboard/documents/by-departement/', documents_by_departement, name='dashboard-documents-by-departement'),
    path('dashboard/documents/recent/', recent_documents, name='dashboard-documents-recent'),
    path('dashboard/validators/count/', validators_count, name='dashboard-validators-count'),
    path('dashboard/users/count/', users_count, name='dashboard-users-count'),
    path('dashboard/invalidate-cache/', invalidate_cache, name='dashboard-invalidate-cache'),
]
