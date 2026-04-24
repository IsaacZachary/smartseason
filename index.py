import os
import sys
import logging
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Global flag to ensure migration runs only once
_db_initialized = False

def application(environ, start_response):
    global _db_initialized
    
    if not _db_initialized:
        try:
            logger.debug("FIRST REQUEST: Initializing database...")
            call_command('migrate', interactive=False)
            
            # Seed data if no admin exists
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(email='admin@smartseason.com').exists():
                logger.debug("Seeding demo data...")
                call_command('seed_data')
                
            _db_initialized = True
            logger.debug("Database initialization complete.")
        except Exception as e:
            logger.error(f"DATABASE INIT FAILED: {e}", exc_info=True)
            # We don't set _db_initialized to True here so we can try again on next request

    try:
        _application = get_wsgi_application()
        return _application(environ, start_response)
    except Exception as e:
        logger.error(f"REQUEST FAILED: {e}", exc_info=True)
        status = '500 Internal Server Error'
        output = f"SERVER ERROR: {str(e)}".encode()
        response_headers = [('Content-type', 'text/plain'),
                            ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]

app = application
