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

    # Force-clear and re-seed to remove 'hbn' and ensure diversity
    if Field.objects.count() < 10:
        try:
            # agent = User.objects.get(email='agent1@smartseason.com')
            agent, _ = User.objects.get_or_create(
                email='agent1@smartseason.com',
                defaults={'username': 'agent1', 'first_name': 'Field', 'last_name': 'Agent', 'role': 'agent'}
            )
            
            # Clear old/test data
            Field.objects.filter(name='hbn').delete()
            
            data = [
                {'name': 'Molo Highland Potato Trial', 'crop': 'Potatoes', 'stage': 'growing', 'days': 15},
                {'name': 'Nakuru Central Maize Estate', 'crop': 'Maize', 'stage': 'planted', 'days': 2},
                {'name': 'Eldoret Wheat Block B-12', 'crop': 'Wheat', 'stage': 'harvested', 'days': 90},
                {'name': 'Kiambu Coffee Plot 4', 'crop': 'Coffee', 'stage': 'growing', 'days': 10},
                {'name': 'Narok Barley Production Field', 'crop': 'Barley', 'stage': 'growing', 'days': 45}, # Will be At Risk due to age
                {'name': 'Bomet Tea Estate (East)', 'crop': 'Tea', 'stage': 'growing', 'days': 200},
                {'name': 'Nyeri Highland Coffee Trial', 'crop': 'Coffee', 'stage': 'harvested', 'days': 120},
                {'name': 'Machakos Fruit Farm Block A', 'crop': 'Mangoes', 'stage': 'ready', 'days': 150},
                {'name': 'Kericho Green Tea Plot', 'crop': 'Tea', 'stage': 'growing', 'days': 5},
                {'name': 'Uasin Gishu Wheat South', 'crop': 'Wheat', 'stage': 'growing', 'days': 140},
                {'name': 'Trans-Nzoia Seed Maize', 'crop': 'Maize', 'stage': 'planted', 'days': 1},
                {'name': 'Murang\'a Avocado Orchard', 'crop': 'Avocados', 'stage': 'growing', 'days': 300}
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
        except Exception:
            pass

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
