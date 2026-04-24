"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()

# Auto-initialize database on Vercel
try:
    print("Checking database...")
    call_command('migrate', interactive=False)
    # Check if we need to seed
    from users.models import User
    if not User.objects.filter(email='admin@smartseason.com').exists():
        call_command('seed_data')
except Exception as e:
    print(f"Database initialization status: {e}")

handler = application
