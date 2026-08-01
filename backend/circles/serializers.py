from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Circle, JoinRequest, Resource
from discussions.models import Discussion
from users.models import UserProfile
from users.serializers import UserProfileSerializer


class CircleSimpleSerializer(serializers.ModelSerializer):
    """Simple serializer for circle data in peer profiles."""
    class Meta:
        model = Circle
        fields = ("id", "name", "domain", "skill_level")


# ============================================================================
# User Serializers
# ============================================================================

class UserBasicSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for user info in circle contexts.
    Only returns essential user information to avoid exposing sensitive data.
    """
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'profile')
        read_only_fields = ('id',)


# ============================================================================
# Circle Serializers
# ============================================================================

class CircleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new circles.
    
    Used by: POST /api/circles/create/
    
    Security Features:
    - created_by is automatically set from request.user (no mass assignment)
    - Validates all required fields
    - Prevents invalid skill levels and domains
    - Enforces maximum members constraint
    """
    
    class Meta:
        model = Circle
        fields = (
            'name', 'description', 'domain', 'skill_level',
            'location', 'preferred_language', 'max_members', 'is_private'
        )
        extra_kwargs = {
            'name': {
                'required': True,
                'min_length': 3,
                'max_length': 150,
                'help_text': 'Circle name (3-150 characters)'
            },
            'description': {
                'required': False,
                'max_length': 1000,
                'help_text': 'Detailed description of circle goals'
            },
            'domain': {
                'required': True,
                'help_text': 'STEM subject area'
            },
            'skill_level': {
                'required': True,
                'help_text': 'Target skill level for members'
            },
            'location': {
                'required': False,
                'max_length': 200,
                'help_text': 'Circle location (city, country, or "Online")'
            },
            'preferred_language': {
                'required': True,
                'help_text': 'Preferred communication language'
            },
            'max_members': {
                'required': False,
                'min_value': 2,
                'max_value': 50,
                'help_text': 'Maximum members allowed (2-50, default 30)'
            },
            'is_private': {
                'required': False,
                'help_text': 'Private circles require join approval'
            },
        }
    
    def validate_name(self, value):
        """Validate and sanitize circle name."""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Circle name cannot be empty.")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description length."""
        if len(value) > 1000:
            raise serializers.ValidationError(
                "Description cannot exceed 1000 characters."
            )
        return value
    
    def validate_max_members(self, value):
        """Validate max members constraint."""
        if value < 2:
            raise serializers.ValidationError(
                "Circle must allow at least 2 members."
            )
        if value > 50:
            raise serializers.ValidationError(
                "Maximum members cannot exceed 50."
            )
        return value
    
    def create(self, validated_data):
        """
        Create a new circle with the authenticated user as creator.
        IMPORTANT: created_by is set from request context, not from data.
        This prevents mass assignment vulnerabilities.
        """
        # Get authenticated user from request context
        user = self.context['request'].user
        
        # Create circle with user as creator
        circle = Circle.objects.create(
            created_by=user,
            **validated_data
        )
        
        # Automatically add creator as first member
        circle.members.add(user)
        
        return circle


class CircleListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for circle list views.
    Returns essential information without detailed member lists.
    
    Used by: GET /api/circles/
    """
    
    creator = UserBasicSerializer(source='created_by', read_only=True)
    member_count = serializers.SerializerMethodField()
    mentor_count = serializers.SerializerMethodField()
    peer_count = serializers.SerializerMethodField()
    available_spots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    is_mentor = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()
    pending_request = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Circle
        fields = (
            'id', 'name', 'description', 'domain', 'skill_level',
            'location', 'preferred_language', 'max_members',
            'is_private', 'creator', 'member_count', 'mentor_count',
            'peer_count', 'available_spots', 'is_full', 'is_member', 
            'is_mentor', 'is_creator', 'pending_request', 'created_at',
            'is_active', 'is_deleted'
        )
        read_only_fields = (
            'id', 'created_at', 'creator', 'member_count', 'mentor_count',
            'peer_count', 'available_spots', 'is_full', 'is_member', 
            'is_mentor', 'is_creator', 'pending_request', 'is_active', 'is_deleted'
        )
    
    def get_member_count(self, obj):
        """Get number of current members from annotated field."""
        return obj.member_count
    
    def get_mentor_count(self, obj):
        """Get number of current mentors from annotated field."""
        return obj.mentor_count
    
    def get_peer_count(self, obj):
        """Get number of peers (non-mentor members)."""
        return obj.get_peer_count()
    
    def get_available_spots(self, obj):
        """Get available member slots."""
        return obj.get_available_spots()
    
    def get_is_full(self, obj):
        """Check if circle is full."""
        return obj.is_full()
    
    def get_is_member(self, obj):
        """Check if current user is a member."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_member(request.user)
        return False
    
    def get_is_mentor(self, obj):
        """Check if current user is a mentor."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_mentor(request.user)
        return False
    
    def get_is_creator(self, obj):
        """Check if current user is the creator."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_creator(request.user)
        return False
    
    def get_pending_request(self, obj):
        """Check if user has pending join request."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return JoinRequest.objects.filter(
                user=request.user,
                circle=obj,
                status='pending'
            ).exists()
        return False


class CircleDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for individual circle views.
    Includes full member and mentor lists.
    
    Used by: GET /api/circles/<id>/
    """
    
    creator = UserBasicSerializer(source='created_by', read_only=True)
    members_list = serializers.SerializerMethodField()
    mentors_list = serializers.SerializerMethodField()
    peers_list = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    mentor_count = serializers.SerializerMethodField()
    peer_count = serializers.SerializerMethodField()
    available_spots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    is_mentor = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()
    pending_request = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Circle
        fields = (
            'id', 'name', 'description', 'domain', 'skill_level',
            'location', 'preferred_language', 'max_members', 'is_private',
            'creator', 'members_list', 'mentors_list', 'peers_list',
            'member_count', 'mentor_count', 'peer_count', 'available_spots',
            'is_full', 'is_member', 'is_mentor', 'is_creator',
            'pending_request', 'created_at', 'updated_at', 'is_active', 'is_deleted'
        )
        read_only_fields = (
            'id', 'created_at', 'updated_at', 'creator', 'members_list',
            'mentors_list', 'peers_list', 'member_count', 'mentor_count',
            'peer_count', 'available_spots', 'is_full', 'is_member', 
            'is_mentor', 'is_creator', 'pending_request', 'is_active', 'is_deleted'
        )
    
    def get_members_list(self, obj):
        """Get list of members only if user is part of the circle."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if obj.is_member(request.user) or obj.is_mentor(request.user) or obj.is_creator(request.user):
                return UserBasicSerializer(obj.members.all(), many=True, context=self.context).data
        return []
    
    def get_mentors_list(self, obj):
        """Get list of mentors only if user is part of the circle."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if obj.is_member(request.user) or obj.is_mentor(request.user) or obj.is_creator(request.user):
                return UserBasicSerializer(obj.mentors.all(), many=True, context=self.context).data
        return []
    
    def get_peers_list(self, obj):
        """Get list of peers (non-mentor, non-creator members) only if user is part of the circle."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if obj.is_member(request.user) or obj.is_mentor(request.user) or obj.is_creator(request.user):
                peers = obj.get_peers()
                return UserBasicSerializer(peers, many=True, context=self.context).data
        return []
    
    def get_member_count(self, obj):
        """Get number of current members."""
        return obj.get_member_count()
    
    def get_mentor_count(self, obj):
        """Get number of current mentors."""
        return obj.get_mentor_count()
    
    def get_peer_count(self, obj):
        """Get number of peers (non-mentor members)."""
        return obj.get_peer_count()
    
    def get_available_spots(self, obj):
        """Get available member slots."""
        return obj.get_available_spots()
    
    def get_is_full(self, obj):
        """Check if circle is full."""
        return obj.is_full()
    
    def get_is_member(self, obj):
        """Check if current user is a member."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_member(request.user)
        return False
    
    def get_is_mentor(self, obj):
        """Check if current user is a mentor."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_mentor(request.user)
        return False
    
    def get_is_creator(self, obj):
        """Check if current user is the creator."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_creator(request.user)
        return False
    
    def get_pending_request(self, obj):
        """Check if user has pending join request."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return JoinRequest.objects.filter(
                user=request.user,
                circle=obj,
                status='pending'
            ).exists()
        return False


# ============================================================================
# Join Request Serializers
# ============================================================================

class JoinRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating join requests.
    
    Used by: POST /api/circles/request/<id>/
    
    Security:
    - user is set from request.user (no mass assignment)
    - circle is set from URL parameter
    - Prevents duplicate pending requests
    """
    
    class Meta:
        model = JoinRequest
        fields = ('message',)
        extra_kwargs = {
            'message': {
                'required': False,
                'max_length': 500,
                'help_text': 'Optional message from the requester'
            },
        }
    
    def create(self, validated_data):
        """
        Create or re-activate a join request.
        User and circle are set from context.
        With unique_together=(user, circle), update_or_create is used so that
        a previously-rejected user can re-apply cleanly.
        """
        user = self.context['request'].user
        circle = self.context['circle']
        
        # Check if there is already a pending request
        existing_pending = JoinRequest.objects.filter(
            user=user,
            circle=circle,
            status='pending'
        ).first()
        
        if existing_pending:
            raise serializers.ValidationError(
                "You already have a pending request for this circle."
            )
        
        # update_or_create handles both first-time apply and re-apply after rejection
        join_request, _ = JoinRequest.objects.update_or_create(
            user=user,
            circle=circle,
            defaults={
                'status': 'pending',
                'message': validated_data.get('message', ''),
            }
        )
        
        return join_request


class JoinRequestListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing join requests.
    
    Used by: Circle creator to see pending requests
    """
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = JoinRequest
        fields = ('id', 'user', 'message', 'status', 'created_at')
        read_only_fields = ('id', 'user', 'message', 'status', 'created_at')


class JoinRequestDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed join request view.
    """
    
    user = UserBasicSerializer(read_only=True)
    circle_name = serializers.CharField(source='circle.name', read_only=True)
    
    class Meta:
        model = JoinRequest
        fields = (
            'id', 'user', 'circle_name', 'message',
            'status', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'user', 'circle_name', 'message',
            'status', 'created_at', 'updated_at'
        )


class DiscussionSerializer(serializers.ModelSerializer):
    """
    Serializer for discussion messages.
    """
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Discussion
        fields = (
            'id', 'user', 'content', 'category',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'user', 'created_at', 'updated_at'
        )


class CreateDiscussionSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new discussion messages.
    """
    category = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Discussion
        fields = (
            'content', 'category'
        )


# ============================================================================
# Resource Serializers
# ============================================================================

class ResourceSerializer(serializers.ModelSerializer):
    """
    Serializer for resource display and listing.
    Includes uploader information and permissions.
    """
    
    uploaded_by = UserBasicSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = (
            'id', 'title', 'description', 'resource_type',
            'file_url', 'external_url', 'uploaded_by', 'created_at',
            'updated_at', 'can_edit', 'can_delete'
        )
        read_only_fields = (
            'id', 'uploaded_by', 'created_at', 'updated_at',
            'can_edit', 'can_delete', 'file_url'
        )
    
    def get_file_url(self, obj):
        """Get the full URL for the uploaded file."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_can_edit(self, obj):
        """Check if current user can edit this resource."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_user_edit(request.user)
        return False
    
    def get_can_delete(self, obj):
        """Check if current user can delete this resource."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_user_delete(request.user)
        return False


class ResourceCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new resources.
    Validates that either file or external_url is provided.
    """
    
    class Meta:
        model = Resource
        fields = (
            'title', 'description', 'resource_type', 'file', 'external_url'
        )
        extra_kwargs = {
            'title': {
                'required': True,
                'max_length': 255,
                'min_length': 3,
                'help_text': 'Resource title (3-255 characters)'
            },
            'description': {
                'required': False,
                'max_length': 1000,
                'help_text': 'Detailed description (max 1000 characters)'
            },
            'resource_type': {
                'required': True,
                'help_text': 'Type of resource'
            },
            'file': {
                'required': False,
                'help_text': 'Upload file (required for PDF, DOC, PPT)'
            },
            'external_url': {
                'required': False,
                'help_text': 'External URL (required for links, YouTube)'
            },
        }
    
    def validate(self, data):
        """Validate that file or URL is provided based on resource type."""
        resource_type = data.get('resource_type')
        file = data.get('file')
        external_url = data.get('external_url')
        
        # Types that require a file
        file_required_types = ['pdf', 'doc', 'ppt']
        
        # Types that require an external URL
        url_required_types = ['link', 'youtube']
        
        if resource_type in file_required_types:
            if not file:
                raise serializers.ValidationError({
                    'file': f"{resource_type.upper()} resources require a file upload."
                })
        
        if resource_type in url_required_types:
            if not external_url:
                raise serializers.ValidationError({
                    'external_url': f"{resource_type.upper()} resources require an external URL."
                })
        
        if resource_type == 'notes':
            # Notes don't require either, but let's ensure at least title + description
            if not data.get('description'):
                raise serializers.ValidationError({
                    'description': "Notes require a description."
                })
        
        return data
    
    def create(self, validated_data):
        """Create resource with uploaded_by from request context."""
        uploaded_by = self.context['request'].user
        circle = self.context['circle']
        
        resource = Resource.objects.create(
            circle=circle,
            uploaded_by=uploaded_by,
            **validated_data
        )
        
        return resource


class ResourceUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating resources.
    Only allows updating certain fields.
    """
    
    class Meta:
        model = Resource
        fields = (
            'title', 'description', 'external_url'
        )
        extra_kwargs = {
            'title': {
                'required': False,
                'max_length': 255,
                'min_length': 3,
            },
            'description': {
                'required': False,
                'max_length': 1000,
            },
            'external_url': {
                'required': False,
            },
        }
