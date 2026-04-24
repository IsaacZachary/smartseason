import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application

# Add the backend directory to the sys.path
backend_path = Path(__file__).resolve().parent / 'backend'
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
app = application
