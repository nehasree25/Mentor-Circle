from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class GeneratedRoadmap(models.Model):
    """Model to store AI-generated learning roadmaps for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_roadmaps')
    roadmap_title = models.CharField(max_length=255)
    roadmap_content = models.JSONField(default=dict, help_text="Structured roadmap data from AI")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Generated Roadmap'
        verbose_name_plural = 'Generated Roadmaps'
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.roadmap_title}"
