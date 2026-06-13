from django.contrib import admin
from django.utils.html import format_html
from .models import GuidanceRequest, CollaborationRequest, Conversation, Message


@admin.register(GuidanceRequest)
class GuidanceRequestAdmin(admin.ModelAdmin):
    """Admin interface for Guidance Requests."""
    
    list_display = (
        'id', 'sender_link', 'mentor_link', 'circle_link',
        'subject', 'status_display', 'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('sender__username', 'mentor__username', 'subject', 'guidance_topic')
    readonly_fields = ('sender', 'mentor', 'circle', 'created_at', 'updated_at', 'responded_at')
    
    fieldsets = (
        ('Participants', {
            'fields': ('sender', 'mentor', 'circle')
        }),
        ('Request Details', {
            'fields': ('subject', 'guidance_topic', 'message')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'responded_at'),
            'classes': ('collapse',)
        }),
    )
    
    def sender_link(self, obj):
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.sender.id,
            obj.sender.username
        )
    sender_link.short_description = 'Student'
    
    def mentor_link(self, obj):
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.mentor.id,
            obj.mentor.username
        )
    mentor_link.short_description = 'Mentor'
    
    def circle_link(self, obj):
        return format_html(
            '<a href="/admin/circles/circle/{}/change/">{}</a>',
            obj.circle.id,
            obj.circle.name
        )
    circle_link.short_description = 'Circle'
    
    def status_display(self, obj):
        colors = {
            'pending': 'blue',
            'accepted': 'green',
            'rejected': 'red',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'


@admin.register(CollaborationRequest)
class CollaborationRequestAdmin(admin.ModelAdmin):
    """Admin interface for Collaboration Requests."""
    
    list_display = (
        'id', 'sender_link', 'receiver_link', 'circle_link',
        'project_topic', 'status_display', 'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('sender__username', 'receiver__username', 'project_topic', 'collaboration_goal')
    readonly_fields = ('sender', 'receiver', 'circle', 'created_at', 'updated_at', 'responded_at')
    
    fieldsets = (
        ('Participants', {
            'fields': ('sender', 'receiver', 'circle')
        }),
        ('Request Details', {
            'fields': ('project_topic', 'collaboration_goal', 'message')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'responded_at'),
            'classes': ('collapse',)
        }),
    )
    
    def sender_link(self, obj):
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.sender.id,
            obj.sender.username
        )
    sender_link.short_description = 'Sender'
    
    def receiver_link(self, obj):
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.receiver.id,
            obj.receiver.username
        )
    receiver_link.short_description = 'Receiver'
    
    def circle_link(self, obj):
        return format_html(
            '<a href="/admin/circles/circle/{}/change/">{}</a>',
            obj.circle.id,
            obj.circle.name
        )
    circle_link.short_description = 'Circle'
    
    def status_display(self, obj):
        colors = {
            'pending': 'blue',
            'accepted': 'green',
            'rejected': 'red',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin interface for Conversations."""
    
    list_display = (
        'id', 'conversation_type', 'participants_display',
        'circle_link', 'message_count', 'is_active_display', 'created_at'
    )
    list_filter = ('conversation_type', 'is_active', 'is_deleted', 'created_at')
    search_fields = ('participants__username', 'circle__name')
    readonly_fields = ('conversation_type', 'guidance_request', 'collaboration_request', 'circle', 'created_at', 'updated_at', 'last_message_at')
    filter_horizontal = ('participants',)
    
    fieldsets = (
        ('Type', {
            'fields': ('conversation_type',)
        }),
        ('Linked Requests', {
            'fields': ('guidance_request', 'collaboration_request')
        }),
        ('Context', {
            'fields': ('circle', 'participants')
        }),
        ('Status', {
            'fields': ('is_active', 'is_deleted')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_message_at'),
            'classes': ('collapse',)
        }),
    )
    
    def participants_display(self, obj):
        names = " ↔ ".join([p.username for p in obj.participants.all()])
        return names
    participants_display.short_description = 'Participants'
    
    def circle_link(self, obj):
        return format_html(
            '<a href="/admin/circles/circle/{}/change/">{}</a>',
            obj.circle.id,
            obj.circle.name
        )
    circle_link.short_description = 'Circle'
    
    def message_count(self, obj):
        count = obj.messages.filter(is_deleted=False).count()
        return format_html(
            '<strong>{}</strong> messages',
            count
        )
    message_count.short_description = 'Messages'
    
    def is_active_display(self, obj):
        if obj.is_deleted:
            return format_html('<span style="color: red;">DELETED</span>')
        elif obj.is_active:
            return format_html('<span style="color: green;">ACTIVE</span>')
        else:
            return format_html('<span style="color: orange;">INACTIVE</span>')
    is_active_display.short_description = 'Status'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin interface for Messages."""
    
    list_display = (
        'id', 'conversation_link', 'sender_link',
        'content_preview', 'is_read', 'created_at'
    )
    list_filter = ('is_read', 'is_deleted', 'created_at')
    search_fields = ('sender__username', 'content')
    readonly_fields = ('conversation', 'sender', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Conversation', {
            'fields': ('conversation',)
        }),
        ('Sender', {
            'fields': ('sender',)
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Status', {
            'fields': ('is_read', 'is_deleted')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def conversation_link(self, obj):
        return format_html(
            '<a href="/admin/mentorship/conversation/{}/change/">Conversation #{}</a>',
            obj.conversation.id,
            obj.conversation.id
        )
    conversation_link.short_description = 'Conversation'
    
    def sender_link(self, obj):
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.sender.id,
            obj.sender.username
        )
    sender_link.short_description = 'Sender'
    
    def content_preview(self, obj):
        preview = obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
        return preview
    content_preview.short_description = 'Message'
