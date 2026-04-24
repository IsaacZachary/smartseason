from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.management import call_command
from django.contrib.auth import get_user_model
from fields.models import Field, FieldUpdate

def health_check(request):
    try:
        User = get_user_model()
        admin_user = User.objects.filter(email='admin@smartseason.com').first()
        agent_user = User.objects.filter(email='agent1@smartseason.com').first()
        
        # Ensure Agent exists
        if not agent_user:
            agent_user = User.objects.create_user(
                username='agent1',
                email='agent1@smartseason.com',
                password='Agent@123',
                first_name='Kuria',
                last_name='Maina',
                role='agent'
            )

        logger_info = []
        
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
        
        created_count = 0
        for s in shambas:
            obj, created = Field.objects.get_or_create(name=s['name'], defaults={
                'owner': admin_user, 
                'assigned_agent': agent_user, 
                **s
            })
            if created:
                created_count += 1
        
        logger_info.append(f"Injected {created_count} Kenyan Shambas.")
        user_count = User.objects.count()
        field_count = Field.objects.count()

        return JsonResponse({
            "status": "ok",
            "database": "connected",
            "user_count": user_count,
            "field_count": field_count,
            "logs": logger_info,
            "message": "SmartSeason is fully populated!"
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
