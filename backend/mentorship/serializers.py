from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GuidanceRequest, CollaborationRequest, Conversation, Message
from users.serializers import UserProfileSerializer
from circles.serializers import CircleSimpleSerializer


# Define UserBasicSerializer here since we need it
class UserBasicSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user info."""
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'profile')
        read_only_fields = ('id',)


# ============================================================================
# Guidance Request Serializers
# ============================================================================

class GuidanceRequestSerializer(serializers.ModelSerializer):
    """Serializer for displaying guidance requests."""
    
    sender = UserBasicSerializer(read_only=True)
    mentor = UserBasicSerializer(read_only=True)
    circle = CircleSimpleSerializer(read_only=True)
    
    class Meta:
        model = GuidanceRequest
        fields = (
            'id', 'sender', 'mentor', 'circle', 'subject',
            'guidance_topic', 'message', 'status', 'created_at',
            'updated_at', 'responded_at'
        )
        read_only_fields = (
            'id', 'sender', 'mentor', 'status', 'created_at',
            'updated_at', 'responded_at'
        )


class GuidanceRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guidance requests."""
    
    class Meta:
        model = GuidanceRequest
        fields = ('subject', 'guidance_topic', 'message')
        extra_kwargs = {
            'subject': {
                'required': True,
                'max_length': 200,
                'help_text': 'Subject area (e.g., Neural Networks)'
            },
            'guidance_topic': {
                'required': True,
                'max_length': 300,
                'help_text': 'Specific topic for guidance'
            },
            'message': {
                'required': True,
                'max_length': 1000,
                'help_text': 'Explain what help you need'
            },
        }
    
    def create(self, validated_data):
        """Create guidance request with sender, mentor, circle from context."""
        sender = self.context['request'].user
        mentor = self.context['mentor']
        circle = self.context['circle']
        
        # Check for existing pending request
        existing = GuidanceRequest.objects.filter(
            sender=sender,
            mentor=mentor,
            circle=circle,
            status='pending'
        ).first()
        
        if existing:
            raise serializers.ValidationError(
                "You already have a pending guidance request with this mentor in this circle."
            )
        
        guidance_request = GuidanceRequest.objects.create(
            sender=sender,
            mentor=mentor,
            circle=circle,
            **validated_data
        )
        
        return guidance_request


# ============================================================================
# Collaboration Request Serializers
# ============================================================================

class CollaborationRequestSerializer(serializers.ModelSerializer):
    """Serializer for displaying collaboration requests."""
    
    sender = UserBasicSerializer(read_only=True)
    receiver = UserBasicSerializer(read_only=True)
    circle = CircleSimpleSerializer(read_only=True)
    
    class Meta:
        model = CollaborationRequest
        fields = (
            'id', 'sender', 'receiver', 'circle', 'project_topic',
            'collaboration_goal', 'message', 'status', 'created_at',
            'updated_at', 'responded_at'
        )
        read_only_fields = (
            'id', 'sender', 'receiver', 'status', 'created_at',
            'updated_at', 'responded_at'
        )


class CollaborationRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating collaboration requests."""
    
    class Meta:
        model = CollaborationRequest
        fields = ('project_topic', 'collaboration_goal', 'message')
        extra_kwargs = {
            'project_topic': {
                'required': True,
                'max_length': 200,
                'help_text': 'Project or topic for collaboration'
            },
            'collaboration_goal': {
                'required': True,
                'max_length': 300,
                'help_text': 'Goal of the collaboration'
            },
            'message': {
                'required': True,
                'max_length': 1000,
                'help_text': 'Explain your collaboration intent'
            },
        }
    
    def create(self, validated_data):
        """Create collaboration request with sender, receiver, circle from context."""
        sender = self.context['request'].user
        receiver = self.context['receiver']
        circle = self.context['circle']
        
        # Check for existing pending request
        existing = CollaborationRequest.objects.filter(
            sender=sender,
            receiver=receiver,
            circle=circle,
            status='pending'
        ).first()
        
        if existing:
            raise serializers.ValidationError(
                "You already have a pending collaboration request with this peer in this circle."
            )
        
        collaboration_request = CollaborationRequest.objects.create(
            sender=sender,
            receiver=receiver,
            circle=circle,
            **validated_data
        )
        
        return collaboration_request


# ============================================================================
# Conversation Serializers
# ============================================================================

class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for displaying conversations."""
    
    participants = UserBasicSerializer(many=True, read_only=True)
    circle = CircleSimpleSerializer(read_only=True)
    title = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = (
            'id', 'conversation_type', 'title', 'participants',
            'other_participant', 'circle', 'is_active', 'created_at',
            'last_message_at', 'unread_count'
        )
        read_only_fields = (
            'id', 'conversation_type', 'participants', 'circle',
            'is_active', 'created_at', 'last_message_at'
        )
    
    def get_title(self, obj):
        """Get conversation title."""
        return obj.get_title()
    
    def get_unread_count(self, obj):
        """Get unread message count for current user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(
                is_deleted=False,
                is_read=False
            ).exclude(sender=request.user).count()
        return 0
    
    def get_other_participant(self, obj):
        """Get the other participant (not current user)."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.participants.exclude(id=request.user.id).first()
            if other:
                return UserBasicSerializer(other, context=self.context).data
        return None


# ============================================================================
# Message Serializers
# ============================================================================

class MessageSerializer(serializers.ModelSerializer):
    """Serializer for displaying messages."""
    
    sender = UserBasicSerializer(read_only=True)
    is_own_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = (
            'id', 'sender', 'content', 'is_read', 'is_own_message',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'sender', 'is_read', 'created_at', 'updated_at'
        )
    
    def get_is_own_message(self, obj):
        """Check if message was sent by current user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender.id == request.user.id
        return False


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages."""
    
    class Meta:
        model = Message
        fields = ('content',)
        extra_kwargs = {
            'content': {
                'required': True,
                'max_length': 2000,
                'help_text': 'Message content'
            },
        }
    
    def create(self, validated_data):
        """Create message with sender and conversation from context."""
        sender = self.context['request'].user
        conversation = self.context['conversation']
        
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            **validated_data
        )
        
        return message


# ============================================================================
# User Profile Serializers
# ============================================================================

class UserProfileDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile detail view.
    Shows ONLY public information - no private data.
    """
    
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name', 'profile'
        )
        read_only_fields = ('id', 'username', 'first_name', 'last_name')
    
    def get_profile(self, obj):
        """Get user profile information."""
        if hasattr(obj, 'profile'):
            profile = obj.profile
            return {
                'role': profile.get_role_display(),
                'bio': profile.bio,
                'profile_picture': self.context['request'].build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                'domains': profile.domains,
                'skills': profile.skills,
                'interests': profile.interests,
                'learning_goals': profile.learning_goals,
                'experience_level': profile.get_experience_level_display(),
            }
        return {}
