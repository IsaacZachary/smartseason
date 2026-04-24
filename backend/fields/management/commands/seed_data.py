from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from fields.models import Field, FieldUpdate
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Seeds the database with initial demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Create Admin
        admin, created = User.objects.get_or_create(
            email='admin@smartseason.com',
            defaults={
                'username': 'admin',
                'role': User.ADMIN,
                'first_name': 'Smart',
                'last_name': 'Admin'
            }
        )
        if created:
            admin.set_password('Admin@123')
            admin.save()
            self.stdout.write('Admin created')

        # Create Agents
        agent1, created = User.objects.get_or_create(
            email='agent1@smartseason.com',
            defaults={
                'username': 'agent1',
                'role': User.AGENT,
                'first_name': 'Kamau',
                'last_name': 'Otieno'
            }
        )
        if created:
            agent1.set_password('Agent@123')
            agent1.save()
            self.stdout.write('Agent 1 created')

        agent2, created = User.objects.get_or_create(
            email='agent2@smartseason.com',
            defaults={
                'username': 'agent2',
                'role': User.AGENT,
                'first_name': 'Faith',
                'last_name': 'Moraa'
            }
        )
        if created:
            agent2.set_password('Agent@123')
            agent2.save()
            self.stdout.write('Agent 2 created')

        # Create Fields
        fields_data = [
            {'name': 'Nakuru North Shamba', 'crop': 'Maize', 'stage': Field.GROWING, 'agent': agent1, 'days_ago': 20},
            {'name': 'Eldoret East Block', 'crop': 'Wheat', 'stage': Field.READY, 'agent': agent1, 'days_ago': 45},
            {'name': 'Kiambu Coffee Estate', 'crop': 'Coffee', 'stage': Field.HARVESTED, 'agent': agent2, 'days_ago': 60},
            {'name': 'Kericho Highlands', 'crop': 'Tea', 'stage': Field.PLANTED, 'agent': agent2, 'days_ago': 5},
            {'name': 'Molo Potato Plot', 'crop': 'Potatoes', 'stage': Field.PLANTED, 'agent': agent1, 'days_ago': 40}, # At Risk (Delayed)
            {'name': 'Nyeri Macadamia', 'crop': 'Macadamia', 'stage': Field.GROWING, 'agent': agent2, 'days_ago': 10}, # At Risk (Inactivity)
        ]

        for fd in fields_data:
            field, created = Field.objects.get_or_create(
                name=fd['name'],
                defaults={
                    'crop_type': fd['crop'],
                    'planting_date': timezone.now().date() - timedelta(days=fd['days_ago']),
                    'current_stage': fd['stage'],
                    'assigned_agent': fd['agent']
                }
            )
            
            if created:
                # Add an initial update
                FieldUpdate.objects.create(
                    field=field,
                    agent=fd['agent'],
                    stage=fd['stage'],
                    notes=f"Initial record for {field.name}."
                )
                
                # For the "Nyeri Macadamia", we make the update very old to trigger "At Risk"
                if fd['name'] == 'Nyeri Macadamia':
                    update = field.updates.first()
                    update.created_at = timezone.now() - timedelta(days=20)
                    update.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo data'))
