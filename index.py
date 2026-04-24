import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application

# Project is now at the root
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
app = application
