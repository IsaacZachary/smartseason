import os
import sys
import logging
from django.core.wsgi import get_wsgi_application

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Vercel needs these at the top level
application = get_wsgi_application()
app = application

logger.debug("Django WSGI application initialized.")
