from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class Field(models.Model):
    PLANTED = 'planted'
    GROWING = 'growing'
    READY = 'ready'
    HARVESTED = 'harvested'
    
    STAGE_CHOICES = [
        (PLANTED, 'Planted'),
        (GROWING, 'Growing'),
        (READY, 'Ready'),
        (HARVESTED, 'Harvested'),
    ]
    
    name = models.CharField(max_length=255)
    crop_type = models.CharField(max_length=255)
    planting_date = models.DateField()
    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default=PLANTED)
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_fields'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.crop_type}"

    @property
    def status(self):
        if self.current_stage == self.HARVESTED:
            return "Completed"
        
        # Check for inactivity or delayed growth
        now = timezone.now()
        days_since_planting = (now.date() - self.planting_date).days
        
        # Get last update
        last_update = self.updates.order_by('-created_at').first()
        days_since_last_update = 0
        if last_update:
            days_since_last_update = (now - last_update.created_at).days
        else:
            days_since_last_update = (now - self.created_at).days

        # Logic for At Risk
        is_delayed = self.current_stage in [self.PLANTED, self.GROWING] and days_since_planting > 30
        is_neglected = days_since_last_update > 14
        
        if is_delayed or is_neglected:
            return "At Risk"
            
        return "Active"

class FieldUpdate(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    stage = models.CharField(max_length=20, choices=Field.STAGE_CHOICES, null=True, blank=True)
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update for {self.field.name} at {self.created_at}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Touch parent field to update its updated_at timestamp
        self.field.save()
