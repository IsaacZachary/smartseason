from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.management import call_command
from django.contrib.auth import get_user_model

def health_check(request):
    try:
        # Force migration if tables are missing
        logger_info = []
        try:
            User = get_user_model()
            User.objects.count()
            logger_info.append("Database tables exist.")
        except Exception:
            logger_info.append("Tables missing. Running migrations...")
            call_command('migrate', interactive=False)
            call_command('seed_data')
            logger_info.append("Migrations and seeding complete.")

        User = get_user_model()
        user_count = User.objects.count()
        
        return JsonResponse({
            "status": "ok",
            "database": "connected",
            "user_count": user_count,
            "logs": logger_info,
            "message": "SmartSeason is ready!"
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
