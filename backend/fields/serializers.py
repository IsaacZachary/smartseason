from rest_framework import serializers
from .models import Field, FieldUpdate
from users.serializers import UserSerializer

class FieldUpdateSerializer(serializers.ModelSerializer):
    agent_name = serializers.ReadOnlyField(source='agent.get_full_name')
    
    class Meta:
        model = FieldUpdate
        fields = ('id', 'field', 'agent', 'agent_name', 'stage', 'notes', 'created_at')
        read_only_fields = ('id', 'agent', 'created_at')

class FieldSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    assigned_agent_details = UserSerializer(source='assigned_agent', read_only=True)
    last_update = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = (
            'id', 'name', 'crop_type', 'planting_date', 'current_stage', 
            'assigned_agent', 'assigned_agent_details', 'status', 
            'created_at', 'updated_at', 'last_update'
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')

    def get_last_update(self, obj):
        last = obj.updates.order_by('-created_at').first()
        if last:
            return FieldUpdateSerializer(last).data
        return None
