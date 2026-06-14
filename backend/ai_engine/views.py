import logging
import traceback
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import GeneratedRoadmap
from .serializers import GeneratedRoadmapSerializer, RoadmapResponseSerializer
from .services import RoadmapGeneratorService

logger = logging.getLogger(__name__)


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
        logger.info(f"Roadmap generation request received from user: {request.user.id}")
        
        try:
            # Initialize roadmap generator service
            service = RoadmapGeneratorService()
            
            # Generate roadmap
            result = service.generate_roadmap(request.user)
            
            if not result['success']:
                logger.warning(f"Roadmap generation failed for user {request.user.id}: {result['error']}")
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
            logger.info(f"Roadmap successfully generated and saved for user: {request.user.id}, roadmap_id: {roadmap.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except ValueError as e:
            logger.error(f"ValueError during roadmap generation for user {request.user.id}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Roadmap generation failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error during roadmap generation for user {request.user.id}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Roadmap generation failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the latest generated roadmap for the user
        
        GET /api/ai/roadmap/latest/
        """
        logger.info(f"Latest roadmap request received from user: {request.user.id}")
        try:
            roadmap = self.get_queryset().first()
            
            if not roadmap:
                logger.info(f"No roadmap found for user: {request.user.id}")
                return Response(
                    {"message": "No roadmap generated yet"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = self.get_serializer(roadmap)
            logger.info(f"Returning latest roadmap for user: {request.user.id}, roadmap_id: {roadmap.id}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching latest roadmap for user {request.user.id}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Failed to fetch latest roadmap", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get all previously generated roadmaps for the user
        
        GET /api/ai/roadmap/history/
        """
        logger.info(f"Roadmap history request received from user: {request.user.id}")
        try:
            roadmaps = self.get_queryset()
            serializer = self.get_serializer(roadmaps, many=True)
            logger.info(f"Returning {roadmaps.count()} roadmaps for user: {request.user.id}")
            return Response({
                "count": roadmaps.count(),
                "roadmaps": serializer.data
            })
        except Exception as e:
            logger.error(f"Error fetching roadmap history for user {request.user.id}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Failed to fetch roadmap history", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def retrieve_roadmap(self, request, pk=None):
        """Get a specific roadmap by ID
        
        GET /api/ai/roadmap/{id}/
        """
        logger.info(f"Retrieve roadmap request received from user: {request.user.id}, roadmap_id: {pk}")
        try:
            roadmap = get_object_or_404(GeneratedRoadmap, id=pk, user=request.user)
            serializer = self.get_serializer(roadmap)
            logger.info(f"Returning roadmap for user: {request.user.id}, roadmap_id: {pk}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving roadmap {pk} for user {request.user.id}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Failed to retrieve roadmap", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
