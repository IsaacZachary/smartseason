from django.contrib import admin
from .models import Field, FieldUpdate

@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop_type', 'current_stage', 'assigned_agent', 'status')
    list_filter = ('current_stage', 'assigned_agent')
    search_fields = ('name', 'crop_type')

@admin.register(FieldUpdate)
class FieldUpdateAdmin(admin.ModelAdmin):
    list_display = ('field', 'agent', 'stage', 'created_at')
    list_filter = ('stage', 'agent')
    readonly_fields = ('created_at',)
