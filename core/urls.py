from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.management import call_command
from django.contrib.auth import get_user_model

def health_check(request):
    try:
        User = get_user_model()
        user_count = User.objects.count()
        
        logger_info = []
        if user_count == 0:
            logger_info.append("Database empty. Seeding demo data...")
            call_command('seed_data')
            user_count = User.objects.count()
            logger_info.append(f"Seeding complete. New user count: {user_count}")
        else:
            logger_info.append(f"Database contains {user_count} users.")

        return JsonResponse({
            "status": "ok",
            "database": "connected",
            "user_count": user_count,
            "logs": logger_info,
            "message": "SmartSeason is ready with data!"
        })
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "database": "connected",
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
