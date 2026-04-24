from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('_/backend/admin/', admin.site.urls),
    path('_/backend/api/auth/', include('users.urls')),
    path('_/backend/api/', include('fields.urls')),
]
