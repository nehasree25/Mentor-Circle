from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for UserProfile model.
    """
    
    list_display = ('get_username', 'role', 'experience_level', 'is_mentor', 'created_at')
    list_filter = ('role', 'experience_level', 'is_mentor', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Profile Information', {
            'fields': ('bio', 'profile_picture')
        }),
        ('Role & Interests', {
            'fields': ('role', 'interests', 'experience_level')
        }),
        ('Mentorship', {
            'fields': ('is_mentor', 'mentorship_expertise')
        }),
        ('Learning', {
            'fields': ('skills', 'learning_goals')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

