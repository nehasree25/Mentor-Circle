from rest_framework import serializers
from .models import GeneratedRoadmap

class GeneratedRoadmapSerializer(serializers.ModelSerializer):
    """Serializer for GeneratedRoadmap model"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GeneratedRoadmap
        fields = ['id', 'user', 'user_name', 'roadmap_title', 'roadmap_content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoadmapGenerationRequestSerializer(serializers.Serializer):
    """Serializer for roadmap generation request validation"""
    # Optional fields for custom prompting (if needed in future)
    custom_prompt = serializers.CharField(required=False, allow_blank=True)


class RoadmapResponseSerializer(serializers.Serializer):
    """Serializer for AI-generated roadmap response"""
    roadmap_title = serializers.CharField()
    learning_phases = serializers.ListField()
    milestones = serializers.ListField()
    suggested_projects = serializers.ListField()
    recommended_technologies = serializers.ListField()
    estimated_timeline = serializers.CharField()
