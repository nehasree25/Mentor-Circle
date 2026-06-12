from django.contrib import admin
from .models import GeneratedRoadmap


@admin.register(GeneratedRoadmap)
class GeneratedRoadmapAdmin(admin.ModelAdmin):
    """Admin interface for GeneratedRoadmap model"""
    list_display = ['user', 'roadmap_title', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['user__username', 'roadmap_title']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Roadmap Details', {
            'fields': ('roadmap_title', 'roadmap_content')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
