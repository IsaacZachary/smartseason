from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "message": "SmartSeason is live and healthy"})

# Actual routes
actual_patterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('fields.urls')),
    path('health/', health_check),
]

# Root mapping for Vercel
urlpatterns = [
    path('_/backend/', include(actual_patterns)),
    path('health/', health_check),
]
