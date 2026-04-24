from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ADMIN = 'admin'
    AGENT = 'agent'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (AGENT, 'Field Agent'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=AGENT)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"
