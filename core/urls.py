from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.management import call_command
from django.contrib.auth import get_user_model
from fields.models import Field, FieldUpdate

def health_check(request):
    try:
        User = get_user_model()
        
        # Force correct role for the admin if it already exists
        admin_candidate = User.objects.filter(email='admin@smartseason.com').first()
        if admin_candidate and admin_candidate.role != 'admin':
            admin_candidate.role = 'admin'
            admin_candidate.save()
            
        user_count = User.objects.count()
        logger_info = []
        
        if user_count <= 1: # Only admin exists or nothing
            logger_info.append("Database needs seeding. Creating demo data...")
            # Ensure Admin has correct role
            if not admin_candidate:
                admin_user = User.objects.create_superuser(
                    username='admin',
                    email='admin@smartseason.com',
                    password='Admin@123',
                    first_name='SmartSeason',
                    last_name='Admin',
                    role='admin'
                )
            else:
                admin_user = admin_candidate

            # Create Agent
            agent_user, _ = User.objects.get_or_create(
                email='agent1@smartseason.com',
                defaults={
                    'username': 'agent1',
                    'password': 'Agent@123',
                    'first_name': 'Kuria',
                    'last_name': 'Maina',
                    'role': 'agent'
                }
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
                Field.objects.get_or_create(name=s['name'], defaults={
                    'owner': admin_user, 
                    'assigned_agent': agent_user, 
                    **s
                })
                
            user_count = User.objects.count()
            logger_info.append(f"Seeding complete. Admin promoted and shambas created.")
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
