from django.utils import timezone
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
        try:
            queryset = self.get_queryset()
            total_fields = queryset.count()
            
            now = timezone.now()
            fields = list(queryset)
            status_counts = {'Active': 0, 'At Risk': 0, 'Completed': 0}
            no_recent_updates = 0
            
            for f in fields:
                # Use property for count
                s = f.status
                status_counts[s] = status_counts.get(s, 0) + 1
                
                # Manual check for stale updates
                last_update = f.updates.order_by('-created_at').first()
                last_activity = last_update.created_at if last_update else f.created_at
                if (now - last_activity).days > 14:
                    no_recent_updates += 1
                    
            return Response({
                'total_fields': total_fields,
                'status_breakdown': status_counts,
                'no_recent_updates': no_recent_updates
            })
        except Exception as e:
            import traceback
            return Response({"error": traceback.format_exc()}, status=500)

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
