from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import GeneratedRoadmap
from .serializers import GeneratedRoadmapSerializer, RoadmapResponseSerializer
from .services import RoadmapGeneratorService


class AIEngineViewSet(viewsets.ModelViewSet):
    """ViewSet for AI-powered learning roadmap generation"""
    queryset = GeneratedRoadmap.objects.all()
    serializer_class = GeneratedRoadmapSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return roadmaps for the authenticated user only"""
        return GeneratedRoadmap.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new AI learning roadmap for the authenticated user
        
        POST /api/ai/roadmap/generate/
        """
        try:
            # Initialize roadmap generator service
            service = RoadmapGeneratorService()
            
            # Generate roadmap
            result = service.generate_roadmap(request.user)
            
            if not result['success']:
                return Response(
                    {"error": result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract roadmap data
            roadmap_data = result['roadmap']
            roadmap_title = roadmap_data.get('roadmap_title', 'Personalized Learning Roadmap')
            
            # Save to database
            roadmap = GeneratedRoadmap.objects.create(
                user=request.user,
                roadmap_title=roadmap_title,
                roadmap_content=roadmap_data
            )
            
            # Return serialized roadmap
            serializer = self.get_serializer(roadmap)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {"error": f"Failed to generate roadmap: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the latest generated roadmap for the user
        
        GET /api/ai/roadmap/latest/
        """
        roadmap = self.get_queryset().first()
        
        if not roadmap:
            return Response(
                {"message": "No roadmap generated yet"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(roadmap)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get all previously generated roadmaps for the user
        
        GET /api/ai/roadmap/history/
        """
        roadmaps = self.get_queryset()
        serializer = self.get_serializer(roadmaps, many=True)
        return Response({
            "count": roadmaps.count(),
            "roadmaps": serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def retrieve_roadmap(self, request, pk=None):
        """Get a specific roadmap by ID
        
        GET /api/ai/roadmap/{id}/
        """
        roadmap = get_object_or_404(GeneratedRoadmap, id=pk, user=request.user)
        serializer = self.get_serializer(roadmap)
        return Response(serializer.data)
