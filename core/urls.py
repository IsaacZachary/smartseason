from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    # Auto-seed trigger for production if database is empty
    from fields.models import Field
    from users.models import User
    from django.utils import timezone
def health_check(request):
    from fields.models import Field
    from users.models import User
    from django.utils import timezone
    from datetime import timedelta
    
    # 1. Force verify the admin user
    try:
        u = User.objects.get(email='admin@smartseason.com')
        u.role = 'admin'
        u.save()
        admin_status = "verified"
    except User.DoesNotExist:
        admin_status = "user_not_found"

    # 2. Seed if empty
    if Field.objects.count() == 0:
        try:
            # Ensure agent exists
            agent, _ = User.objects.get_or_create(
                email='agent1@smartseason.com',
                defaults={'username': 'agent1', 'first_name': 'Field', 'last_name': 'Agent', 'role': 'agent'}
            )
            
            data = [
                {'name': 'Molo Potato Trial', 'crop': 'Potatoes', 'stage': 'growing', 'days': 15},
                {'name': 'Nakuru Maize Estate', 'crop': 'Maize', 'stage': 'planted', 'days': 2},
                {'name': 'Eldoret Wheat Block B', 'crop': 'Wheat', 'stage': 'ready', 'days': 60},
                {'name': 'Kiambu Coffee Plot 4', 'crop': 'Coffee', 'stage': 'growing', 'days': 10}
            ]
            for d in data:
                Field.objects.get_or_create(
                    name=d['name'], 
                    defaults={
                        'crop_type': d['crop'], 
                        'planting_date': timezone.now().date() - timedelta(days=d['days']), 
                        'current_stage': d['stage'], 
                        'assigned_agent': agent
                    }
                )
        except Exception as e:
            return JsonResponse({'status': 'seeding_failed', 'error': str(e)})

    return JsonResponse({
        'status': 'ok',
        'field_count': Field.objects.count(),
        'admin_status': admin_status,
        'user_role': User.objects.get(email='admin@smartseason.com').role
    })

urlpatterns = [
    path('_/backend/admin/', admin.site.urls),
    path('_/backend/api/auth/', include('users.urls')),
    path('_/backend/api/', include('fields.urls')),
    path('_/backend/health/', health_check),
]
