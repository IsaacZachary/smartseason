import os
import sys
import logging
from django.core.wsgi import get_wsgi_application
from django.http import HttpResponse

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

def application(environ, start_response):
    try:
        # Lazy load the real application
        _application = get_wsgi_application()
        return _application(environ, start_response)
    except Exception as e:
        logger.error(f"DJANGO BOOT ERROR: {e}", exc_info=True)
        status = '500 Internal Server Error'
        output = f"DJANGO BOOT ERROR: {str(e)}".encode()
        response_headers = [('Content-type', 'text/plain'),
                            ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]

# Alias for Vercel
app = application
