from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Backend is alive"})

# Define the actual routes
actual_patterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('fields.urls')),
    path('health/', health_check),
]

# Wrap everything in the Vercel prefix to avoid 404s
urlpatterns = [
    path('_/backend/', include(actual_patterns)),
    # Fallback for root-level health check
    path('health/', health_check),
]
