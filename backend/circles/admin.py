from django.contrib import admin
from django.utils.html import format_html
from .models import Circle, JoinRequest


@admin.register(Circle)
class CircleAdmin(admin.ModelAdmin):
    """
    Admin interface for Circle model management.
    Provides comprehensive circle administration capabilities.
    """
    
    # Columns displayed in list view
    list_display = (
        'name', 'creator_link', 'domain', 'skill_level',
        'member_count_display', 'mentor_count_display', 'location',
        'is_full_display', 'created_at'
    )
    
    # Filters in sidebar
    list_filter = ('domain', 'skill_level', 'preferred_language', 'created_at')
    
    # Search fields
    search_fields = ('name', 'description', 'created_by__username', 'location')
    
    # Read-only fields
    readonly_fields = ('created_at', 'updated_at', 'member_stats', 'mentor_stats')
    
    # Fieldsets for organized editing
    fieldsets = (
        ('Circle Information', {
            'fields': ('name', 'description', 'created_by')
        }),
        ('Learning Details', {
            'fields': ('domain', 'skill_level')
        }),
        ('Location & Language', {
            'fields': ('location', 'preferred_language')
        }),
        ('Capacity Settings', {
            'fields': ('max_members',)
        }),
        ('Members & Mentors', {
            'fields': ('members', 'mentors')
        }),
        ('Statistics', {
            'fields': ('member_stats', 'mentor_stats'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # How many items to display per page
    list_per_page = 25
    
    # Ordering
    ordering = ('-created_at',)
    
    # Filter horizontal for M2M fields (easier selection)
    filter_horizontal = ('members', 'mentors')
    
    # ====================================================================
    # Display Methods
    # ====================================================================
    
    def creator_link(self, obj):
        """Display creator with link to user."""
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.created_by.id,
            obj.created_by.get_full_name() or obj.created_by.username
        )
    creator_link.short_description = 'Creator'
    
    def member_count_display(self, obj):
        """Display member count with color coding."""
        count = obj.get_member_count()
        max_count = obj.max_members
        
        if count >= max_count:
            color = 'red'
            label = f'{count}/{max_count} (FULL)'
        elif count >= max_count * 0.8:
            color = 'orange'
            label = f'{count}/{max_count}'
        else:
            color = 'green'
            label = f'{count}/{max_count}'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            label
        )
    member_count_display.short_description = 'Members'
    
    def mentor_count_display(self, obj):
        """Display mentor count with color coding."""
        count = obj.get_mentor_count()
        
        if count >= 5:
            color = 'red'
            label = f'{count}/5 (MAX)'
        elif count >= 3:
            color = 'orange'
            label = f'{count}/5'
        else:
            color = 'green'
            label = f'{count}/5'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            label
        )
    mentor_count_display.short_description = 'Mentors'
    
    def is_full_display(self, obj):
        """Display if circle is full."""
        if obj.is_full():
            return format_html(
                '<span style="color: red; font-weight: bold;">FULL</span>'
            )
        else:
            available = obj.get_available_spots()
            return format_html(
                '<span style="color: green;">{}  available</span>',
                available
            )
    is_full_display.short_description = 'Status'
    
    def member_stats(self, obj):
        """Display detailed member statistics."""
        count = obj.get_member_count()
        max_count = obj.max_members
        available = obj.get_available_spots()
        usage_percent = (count / max_count * 100) if max_count > 0 else 0
        
        return format_html(
            '<strong>Members:</strong> {} / {} ({:.1f}%)<br>'
            '<strong>Available Spots:</strong> {}<br>',
            count,
            max_count,
            usage_percent,
            available
        )
    member_stats.short_description = 'Member Statistics'
    
    def mentor_stats(self, obj):
        """Display detailed mentor statistics."""
        count = obj.get_mentor_count()
        
        return format_html(
            '<strong>Current Mentors:</strong> {} / 5<br>',
            count
        )
    mentor_stats.short_description = 'Mentor Statistics'
    
    # ====================================================================
    # Actions
    # ====================================================================
    
    def make_full_action(self, request, queryset):
        """Set circles to maximum capacity."""
        updated = 0
        for circle in queryset:
            current = circle.members.count()
            if current < circle.max_members:
                updated += 1
        
        self.message_user(
            request,
            f'{updated} circle(s) processed.'
        )
    make_full_action.short_description = 'Process selected circles'
    
    actions = [make_full_action]
    
    # ====================================================================
    # Save Hooks
    # ====================================================================
    
    def save_model(self, request, obj, form, change):
        """
        Save model with validation.
        Called before saving to database.
        """
        obj.full_clean()  # Run model validation
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        """
        Optimize queryset for admin list view.
        Uses select_related to reduce database queries.
        """
        qs = super().get_queryset(request)
        return qs.select_related('created_by').prefetch_related(
            'members', 'mentors'
        )


@admin.register(JoinRequest)
class JoinRequestAdmin(admin.ModelAdmin):
    """
    Admin interface for JoinRequest model management.
    Handles circle join requests for private circles.
    
    Features:
    - View pending requests
    - Approve/reject requests
    - See requester information
    - Filter by status
    - Quick actions
    """
    
    # Columns displayed in list view
    list_display = (
        'user_link', 'circle_link', 'status_display',
        'message_preview', 'created_at'
    )
    
    # Filters in sidebar
    list_filter = ('status', 'created_at')
    
    # Search fields
    search_fields = (
        'user__username',
        'user__first_name',
        'user__last_name',
        'circle__name',
        'message'
    )
    
    # Read-only fields
    readonly_fields = (
        'user', 'circle', 'message', 'created_at', 'updated_at',
        'user_profile_info'
    )
    
    # Fieldsets for organized viewing
    fieldsets = (
        ('Request Information', {
            'fields': ('user_link', 'circle_link', 'status')
        }),
        ('Requester Message', {
            'fields': ('message',),
            'classes': ('wide',)
        }),
        ('User Profile', {
            'fields': ('user_profile_info',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # How many items per page
    list_per_page = 50
    
    # Ordering
    ordering = ('-created_at',)
    
    # ====================================================================
    # Display Methods
    # ====================================================================
    
    def user_link(self, obj):
        """Display user with link to user admin."""
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.user.id,
            obj.user.get_full_name() or obj.user.username
        )
    user_link.short_description = 'User'
    
    def circle_link(self, obj):
        """Display circle with link to circle admin."""
        return format_html(
            '<a href="/admin/circles/circle/{}/change/">{}</a>',
            obj.circle.id,
            obj.circle.name
        )
    circle_link.short_description = 'Circle'
    
    def status_display(self, obj):
        """Display status with color coding."""
        colors = {
            'pending': 'blue',
            'accepted': 'green',
            'rejected': 'red',
        }
        color = colors.get(obj.status, 'gray')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def message_preview(self, obj):
        """Display preview of requester's message."""
        if obj.message:
            preview = obj.message[:50]
            if len(obj.message) > 50:
                preview += '...'
            return preview
        return '—'
    message_preview.short_description = 'Message'
    
    def user_profile_info(self, obj):
        """Display user profile information."""
        user = obj.user
        profile = user.profile if hasattr(user, 'profile') else None
        
        info = f'<strong>Username:</strong> {user.username}<br>'
        info += f'<strong>Email:</strong> {user.email}<br>'
        info += f'<strong>Full Name:</strong> {user.get_full_name()}<br>'
        
        if profile:
            info += f'<strong>Role:</strong> {profile.get_role_display()}<br>'
            info += f'<strong>Experience:</strong> {profile.get_experience_level_display()}<br>'
        
        return format_html(info)
    user_profile_info.short_description = 'User Profile'
    
    # ====================================================================
    # Actions
    # ====================================================================
    
    def approve_requests(self, request, queryset):
        """Bulk approve pending requests."""
        pending = queryset.filter(status='pending')
        approved_count = 0
        failed_count = 0
        
        for join_request in pending:
            success, message = join_request.approve()
            if success:
                approved_count += 1
            else:
                failed_count += 1
        
        message = f'Approved: {approved_count}'
        if failed_count > 0:
            message += f' | Failed: {failed_count}'
        
        self.message_user(request, message)
    approve_requests.short_description = 'Approve selected requests'
    
    def reject_requests(self, request, queryset):
        """Bulk reject pending requests."""
        pending = queryset.filter(status='pending')
        rejected_count = 0
        
        for join_request in pending:
            join_request.reject()
            rejected_count += 1
        
        self.message_user(request, f'Rejected: {rejected_count}')
    reject_requests.short_description = 'Reject selected requests'
    
    actions = [approve_requests, reject_requests]
    
    # ====================================================================
    # Queryset Optimization
    # ====================================================================
    
    def get_queryset(self, request):
        """
        Optimize queryset for admin list view.
        Uses select_related and prefetch_related for efficiency.
        """
        qs = super().get_queryset(request)
        return qs.select_related(
            'user', 'circle', 'circle__created_by'
        ).prefetch_related('user__profile')

