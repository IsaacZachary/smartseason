from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    # Auto-seed trigger for production if database is empty
    from fields.models import Field
    from users.models import User
    from django.utils import timezone
    from datetime import timedelta
    
    if Field.objects.count() == 0:
        try:
            admin_user = User.objects.get(email='admin@smartseason.com')
            agent = User.objects.get(email='agent1@smartseason.com')
            data = [
                {'name': 'Molo Potato Trial', 'crop': 'Potatoes', 'stage': 'growing', 'days': 15},
                {'name': 'Nakuru Maize Estate', 'crop': 'Maize', 'stage': 'planted', 'days': 2},
                {'name': 'Eldoret Wheat Block B', 'crop': 'Wheat', 'stage': 'ready', 'days': 60},
                {'name': 'Kiambu Coffee Plot 4', 'crop': 'Coffee', 'stage': 'growing', 'days': 10},
                {'name': 'Narok Barley Field', 'crop': 'Barley', 'stage': 'at-risk', 'days': 40},
                {'name': 'Bomet Tea Estate', 'crop': 'Tea', 'stage': 'growing', 'days': 200},
                {'name': 'Nyeri Highland Trial', 'crop': 'Coffee', 'stage': 'planted', 'days': 5},
                {'name': 'Machakos Fruit Farm', 'crop': 'Mangoes', 'stage': 'ready', 'days': 150}
            ]
            for d in data:
                Field.objects.get_or_create(
                    name=d['name'], 
                    defaults={
                        'crop_type': d['crop'], 
                        'planting_date': timezone.now().date() - timedelta(days=d['days']), 
                        'current_stage': 'harvested' if d['stage'] == 'ready' else d['stage'], 
                        'assigned_agent': agent
                    }
                )
        except Exception as e:
            return JsonResponse({'status': 'seeding_failed', 'error': str(e)})

    return JsonResponse({
        'status': 'ok',
        'database': 'connected',
        'field_count': Field.objects.count()
    })

urlpatterns = [
    path('_/backend/admin/', admin.site.urls),
    path('_/backend/api/auth/', include('users.urls')),
    path('_/backend/api/', include('fields.urls')),
    path('_/backend/health/', health_check),
]
