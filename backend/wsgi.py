import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application

# Add the backend directory to the sys.path
path = Path(__file__).resolve().parent
if str(path) not in sys.path:
    sys.path.append(str(path))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
app = application
