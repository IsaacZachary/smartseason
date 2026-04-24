import os
import sys
import logging
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()

# Auto-initialize database on Vercel
try:
    logger.debug("Checking database migrations...")
    call_command('migrate', interactive=False)
    # Check if we need to seed
    from users.models import User
    if not User.objects.filter(email='admin@smartseason.com').exists():
        logger.debug("Seeding demo data...")
        call_command('seed_data')
except Exception as e:
    logger.error(f"Database initialization status: {e}")

# Alias for Vercel
app = application
