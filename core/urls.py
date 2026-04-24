from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.contrib.auth import get_user_model

def health_check(request):
    try:
        User = get_user_model()
        user_count = User.objects.count()
        admin_exists = User.objects.filter(email='admin@smartseason.com').exists()
        return JsonResponse({
            "status": "ok",
            "database": "connected",
            "user_count": user_count,
            "admin_ready": admin_exists,
            "message": "Backend is fully operational"
        })
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "database": "failed",
            "error_detail": str(e)
        }, status=500)

actual_patterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('fields.urls')),
    path('health/', health_check),
]

urlpatterns = [
    path('_/backend/', include(actual_patterns)),
    path('health/', health_check),
]
