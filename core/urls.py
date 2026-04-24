from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.management import call_command
from django.contrib.auth import get_user_model
from fields.models import Field, FieldUpdate

def health_check(request):
    try:
        User = get_user_model()
        user_count = User.objects.count()
        
        logger_info = []
        if user_count == 0:
            logger_info.append("Database empty. Creating demo data...")
            # Create Admin
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@smartseason.com',
                password='Admin@123',
                first_name='SmartSeason',
                last_name='Admin'
            )
            # Create Agent
            agent_user = User.objects.create_user(
                username='agent1',
                email='agent1@smartseason.com',
                password='Agent@123',
                first_name='Kuria',
                last_name='Maina',
                role='agent' # Matches choices in models.py
            )
            
            # Create Shambas (Kenyan Context)
            shambas = [
                {
                    'name': 'Nakuru North Shamba',
                    'location': 'Nakuru',
                    'crop_type': 'Maize',
                    'size_acres': 15.5,
                    'status': 'ACTIVE'
                },
                {
                    'name': 'Eldoret East Farm',
                    'location': 'Eldoret',
                    'crop_type': 'Wheat',
                    'size_acres': 25.0,
                    'status': 'AT_RISK'
                },
                {
                    'name': 'Kiambu Coffee Estate',
                    'location': 'Kiambu',
                    'crop_type': 'Coffee',
                    'size_acres': 10.0,
                    'status': 'ACTIVE'
                }
            ]
            
            for s in shambas:
                Field.objects.create(owner=admin_user, assigned_agent=agent_user, **s)
                
            user_count = User.objects.count()
            logger_info.append(f"Seeding complete. Created admin and {user_count-1} other users.")
        else:
            logger_info.append(f"Database ready with {user_count} users.")

        return JsonResponse({
            "status": "ok",
            "database": "connected",
            "user_count": user_count,
            "logs": logger_info,
            "message": "SmartSeason is live with Kenyan data!"
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
