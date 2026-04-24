import os
import sys
import logging
from django.core.wsgi import get_wsgi_application

# Configure logging to see errors in Vercel logs
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    logger.debug("Starting Django WSGI application...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    application = get_wsgi_application()
    app = application
    logger.debug("Django initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Django: {e}", exc_info=True)
    # Re-raise to ensure Vercel knows it failed
    raise e
