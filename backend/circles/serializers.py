from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Circle, JoinRequest, Discussion
from users.models import UserProfile
from users.serializers import UserProfileSerializer


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


class CircleDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for individual circle views.
    Includes full member and mentor lists.
    
    Used by: GET /api/circles/<id>/
    """
    
    creator = UserBasicSerializer(source='created_by', read_only=True)
    members_list = UserBasicSerializer(source='members', many=True, read_only=True)
    mentors_list = UserBasicSerializer(source='mentors', many=True, read_only=True)
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
    
    def get_peers_list(self, obj):
        """Get list of peers (non-mentor, non-creator members)."""
        peers = obj.get_peers()
        return UserBasicSerializer(peers, many=True, context=self.context).data
    
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
        Create a join request.
        User and circle are set from context.
        """
        user = self.context['request'].user
        circle = self.context['circle']
        
        # Check for duplicate pending request
        existing = JoinRequest.objects.filter(
            user=user,
            circle=circle,
            status='pending'
        ).first()
        
        if existing:
            raise serializers.ValidationError(
                "You already have a pending request for this circle."
            )
        
        # Create join request
        join_request = JoinRequest.objects.create(
            user=user,
            circle=circle,
            **validated_data
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
