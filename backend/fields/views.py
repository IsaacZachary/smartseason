from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Field, FieldUpdate
from .serializers import FieldSerializer, FieldUpdateSerializer
from users.models import User

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == User.ADMIN

class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role == User.ADMIN:
            return Field.objects.all().order_by('-created_at')
        return Field.objects.filter(assigned_agent=user).order_by('-created_at')

    def perform_create(self, serializer):
        # Only admin can create, though we should check permissions too
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_update(self, request, pk=None):
        field = self.get_object()
        serializer = FieldUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # Update field stage if provided
            new_stage = serializer.validated_data.get('stage')
            if new_stage:
                field.current_stage = new_stage
                field.save()
            
            serializer.save(agent=request.user, field=field)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        total_fields = queryset.count()
        
        # We compute status in memory for now because it's a property
        # For a real app, we'd store it or use more complex SQL
        fields = list(queryset)
        status_counts = {
            'Active': 0,
            'At Risk': 0,
            'Completed': 0
        }
        stage_counts = {
            'planted': 0,
            'growing': 0,
            'ready': 0,
            'harvested': 0
        }
        
        for f in fields:
            status_counts[f.status] += 1
            stage_counts[f.current_stage] += 1
            
        return Response({
            'total_fields': total_fields,
            'status_breakdown': status_counts,
            'stage_breakdown': stage_counts
        })

class FieldUpdateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FieldUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        field_id = self.request.query_params.get('field_id')
        if field_id:
            return FieldUpdate.objects.filter(field_id=field_id).order_by('-created_at')
        
        user = self.request.user
        if user.role == User.ADMIN:
            return FieldUpdate.objects.all().order_by('-created_at')
        return FieldUpdate.objects.filter(field__assigned_agent=user).order_by('-created_at')
