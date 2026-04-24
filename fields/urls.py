from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FieldViewSet, FieldUpdateViewSet

router = DefaultRouter()
router.register(r'fields', FieldViewSet, basename='field')
router.register(r'updates', FieldUpdateViewSet, basename='fieldupdate')

urlpatterns = [
    path('', include(router.urls)),
]
