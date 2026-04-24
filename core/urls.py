from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    from fields.models import Field, FieldUpdate
    from users.models import User
    from django.utils import timezone
    from datetime import timedelta

    # 1. Force verify admin role
    admin_status = "user_not_found"
    try:
        u = User.objects.get(email='admin@smartseason.com')
        u.role = 'admin'
        u.save()
        admin_status = "verified"
    except User.DoesNotExist:
        pass

    # 2. Seed fields + records if registry is thin
    if Field.objects.count() < 10:
        try:
            agent, _ = User.objects.get_or_create(
                email='agent1@smartseason.com',
                defaults={
                    'username': 'agent1',
                    'first_name': 'Kuria',
                    'last_name': 'Maina',
                    'role': 'agent'
                }
            )
            admin_user = User.objects.get(email='admin@smartseason.com')

            # Remove test/junk data
            Field.objects.filter(name__in=['hbn', 'ggf']).delete()

            fields_data = [
                {'name': 'Molo Highland Potato Trial',   'crop': 'Potatoes', 'stage': 'growing',   'days': 15},
                {'name': 'Nakuru Central Maize Estate',  'crop': 'Maize',    'stage': 'planted',   'days': 2},
                {'name': 'Eldoret Wheat Block B-12',     'crop': 'Wheat',    'stage': 'harvested', 'days': 90},
                {'name': 'Kiambu Coffee Plot 4',         'crop': 'Coffee',   'stage': 'growing',   'days': 10},
                {'name': 'Narok Barley Production Field','crop': 'Barley',   'stage': 'growing',   'days': 45},
                {'name': 'Bomet Tea Estate (East)',      'crop': 'Tea',      'stage': 'growing',   'days': 200},
                {'name': 'Nyeri Highland Coffee Trial',  'crop': 'Coffee',   'stage': 'harvested', 'days': 120},
                {'name': 'Machakos Fruit Farm Block A',  'crop': 'Mangoes',  'stage': 'ready',     'days': 150},
                {'name': 'Kericho Green Tea Plot',       'crop': 'Tea',      'stage': 'growing',   'days': 5},
                {'name': 'Uasin Gishu Wheat South',      'crop': 'Wheat',    'stage': 'growing',   'days': 140},
                {'name': 'Trans-Nzoia Seed Maize',       'crop': 'Maize',    'stage': 'planted',   'days': 1},
                {"name": "Murang'a Avocado Orchard",     'crop': 'Avocados', 'stage': 'growing',   'days': 300},
            ]

            records = {
                'Molo Highland Potato Trial':   [
                    ('growing', 'Crop germination confirmed. Uniform stand established across all rows. Irrigation schedule on track.', agent, 10),
                    ('planted', 'Seeds dressed and planted. Soil moisture optimal. Expecting germination within 7 days.', agent, 15),
                ],
                'Eldoret Wheat Block B-12': [
                    ('harvested', 'Final harvest complete. Yield: 4.2 tonnes/acre. Grain moisture at 13%. Ready for storage.', admin_user, 2),
                    ('ready',    'Crop matured. Grain hardened. Combine harvester scheduled for next 72hrs.', agent, 10),
                    ('growing',  'Tillering stage complete. No pest pressure observed. Applied top-dress fertilizer.', agent, 60),
                ],
                'Kiambu Coffee Plot 4': [
                    ('growing', 'Berries at green-to-yellow transition. No signs of CBD or leaf rust. Continue monitoring.', agent, 5),
                ],
                'Narok Barley Production Field': [
                    ('growing', 'Growth appears stunted in the eastern block. Soil pH test recommended. Possible micronutrient deficiency.', agent, 20),
                ],
                'Bomet Tea Estate (East)': [
                    ('growing', 'Third plucking round complete. 280kg green leaf harvested. Quality grade: BOP.', agent, 7),
                    ('growing', 'Heavy rains caused minor waterlogging on slope 3. Drainage channels cleared.', agent, 30),
                ],
                'Nyeri Highland Coffee Trial': [
                    ('harvested', 'Final picking done. 1.8 tonnes cherry harvested. Delivered to factory. Season closed.', admin_user, 5),
                    ('ready',    'Main crop ripening well. 80% of berries red. Harvesting begins next week.', agent, 25),
                ],
                'Machakos Fruit Farm Block A': [
                    ('ready',   'Mangoes at full maturity. Brix reading: 18. Ready for market dispatch.', agent, 3),
                    ('growing', 'Flowering complete. Fruit set at approximately 65%. Pest management spray applied.', agent, 50),
                ],
                'Uasin Gishu Wheat South': [
                    ('growing', 'Crop at stem elongation stage. Fungicide applied to manage rust risk. Looking healthy.', agent, 30),
                    ('growing', 'Germination 92%. Top-dressing with CAN completed. Good canopy closure expected.', agent, 100),
                ],
            }

            for d in fields_data:
                field, created = Field.objects.get_or_create(
                    name=d['name'],
                    defaults={
                        'crop_type': d['crop'],
                        'planting_date': timezone.now().date() - timedelta(days=d['days']),
                        'current_stage': d['stage'],
                        'assigned_agent': agent,
                    }
                )
                # Seed records only on fresh fields
                if created and d['name'] in records:
                    for stage, notes, recorder, days_ago in records[d['name']]:
                        update = FieldUpdate(
                            field=field,
                            agent=recorder,
                            stage=stage,
                            notes=notes,
                        )
                        update.save()
                        # Backdate the record
                        FieldUpdate.objects.filter(pk=update.pk).update(
                            created_at=timezone.now() - timedelta(days=days_ago)
                        )

        except Exception as e:
            return JsonResponse({'status': 'seeding_error', 'error': str(e)})

    return JsonResponse({
        'status': 'ok',
        'field_count': Field.objects.count(),
        'admin_status': admin_status,
    })

urlpatterns = [
    path('_/backend/admin/', admin.site.urls),
    path('_/backend/api/auth/', include('users.urls')),
    path('_/backend/api/', include('fields.urls')),
    path('_/backend/health/', health_check),
]
