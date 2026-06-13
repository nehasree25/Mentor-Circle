from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone


class GuidanceRequest(models.Model):
    """
    Guidance Request Model - Students request guidance from mentors.
    
    WORKFLOW:
    1. Student clicks "Request Guidance" on mentor card
    2. Fills out: Subject, Guidance Topic, Message
    3. Mentor receives request in their dashboard
    4. Mentor can Accept or Reject
    5. If accepted: Private GuidanceConversation is created
    
    SECURITY:
    - Only sender and mentor can view
    - Mentor must be part of the circle
    - One pending request per student-mentor-circle combination
    """
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    
    # Participants
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_guidance_requests',
        help_text="Student requesting guidance"
    )
    mentor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_guidance_requests',
        help_text="Mentor being requested"
    )
    
    # Context
    circle = models.ForeignKey(
        'circles.Circle',
        on_delete=models.CASCADE,
        related_name='guidance_requests',
        help_text="Circle context for the guidance"
    )
    
    # Request Details
    subject = models.CharField(
        max_length=200,
        help_text="Subject area (e.g., Neural Networks)"
    )
    guidance_topic = models.CharField(
        max_length=300,
        help_text="Specific topic for guidance"
    )
    message = models.TextField(
        max_length=1000,
        help_text="Detailed message explaining what help is needed"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,
        help_text="Request status"
    )
    rejection_reason = models.TextField(
        max_length=500,
        null=True,
        blank=True,
        help_text="Reason provided by mentor when rejecting the request"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Guidance Request'
        verbose_name_plural = 'Guidance Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['mentor', 'status', '-created_at']),
            models.Index(fields=['sender', 'status', '-created_at']),
            models.Index(fields=['circle', '-created_at']),
        ]
        # Prevent duplicate pending requests
        unique_together = [['sender', 'mentor', 'circle', 'status']]
    
    def __str__(self):
        return f"{self.sender.username} → {self.mentor.username}: {self.subject}"
    
    def accept(self):
        """Accept the guidance request and create a conversation."""
        if self.status != 'pending':
            return False, "Request is not pending"
        
        self.status = 'accepted'
        self.responded_at = timezone.now()
        self.save()
        
        # Add the mentor to the circle's mentors if not already there
        can_add, reason = self.circle.can_add_mentor(self.mentor)
        if can_add:
            self.circle.mentors.add(self.mentor)
        
        # Handle adding the sender to the circle if needed
        if self.circle.is_private:
            # For private circles, add sender as member if not already a member
            if not self.circle.is_member(self.sender) and not self.circle.is_mentor(self.sender) and not self.circle.is_creator(self.sender):
                self.circle.members.add(self.sender)
                # Auto-add as mentor if sender is a registered mentor
                if hasattr(self.sender, 'profile') and self.sender.profile.role == 'mentor':
                    can_add_sender, _ = self.circle.can_add_mentor(self.sender)
                    if can_add_sender:
                        self.circle.mentors.add(self.sender)
        
        # Create a guidance conversation
        conversation = Conversation.objects.create(
            conversation_type='guidance',
            guidance_request=self,
            circle=self.circle
        )
        conversation.participants.add(self.sender, self.mentor)
        
        return True, "Guidance request accepted and conversation created"
    
    def reject(self, rejection_reason=None):
        """Reject the guidance request with an optional reason."""
        if self.status != 'pending':
            return False, "Request is not pending"
        
        self.status = 'rejected'
        self.rejection_reason = rejection_reason
        self.responded_at = timezone.now()
        self.save()
        
        return True, "Guidance request rejected"


class CollaborationRequest(models.Model):
    """
    Collaboration Request Model - Peers request to collaborate.
    
    WORKFLOW:
    1. Peer clicks "Collaborate" on another peer's card
    2. Fills out: Project Topic, Collaboration Goal, Message
    3. Receiver gets request in their dashboard
    4. Receiver can Accept or Reject
    5. If accepted: Private CollaborationConversation is created
    
    SECURITY:
    - Only sender and receiver can view
    - Both must be members of the circle
    - One pending request per peer-pair-circle combination
    """
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    
    # Participants
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='mentorship_sent_collaboration_requests',
        help_text="Peer initiating collaboration"
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='mentorship_received_collaboration_requests',
        help_text="Peer receiving collaboration request"
    )
    
    # Context
    circle = models.ForeignKey(
        'circles.Circle',
        on_delete=models.CASCADE,
        related_name='collaboration_requests',
        help_text="Circle context for collaboration"
    )
    
    # Request Details
    project_topic = models.CharField(
        max_length=200,
        help_text="Project or topic for collaboration"
    )
    collaboration_goal = models.CharField(
        max_length=300,
        help_text="Goal of the collaboration"
    )
    message = models.TextField(
        max_length=1000,
        help_text="Message explaining collaboration intent"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,
        help_text="Request status"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Collaboration Request'
        verbose_name_plural = 'Collaboration Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['receiver', 'status', '-created_at']),
            models.Index(fields=['sender', 'status', '-created_at']),
            models.Index(fields=['circle', '-created_at']),
        ]
        # Prevent duplicate pending requests
        unique_together = [['sender', 'receiver', 'circle', 'status']]
    
    def __str__(self):
        return f"{self.sender.username} ↔ {self.receiver.username}: {self.project_topic}"
    
    def accept(self):
        """Accept the collaboration request and create a conversation."""
        if self.status != 'pending':
            return False, "Request is not pending"
        
        self.status = 'accepted'
        self.responded_at = timezone.now()
        self.save()
        
        # Create a collaboration conversation
        conversation = Conversation.objects.create(
            conversation_type='collaboration',
            collaboration_request=self,
            circle=self.circle
        )
        conversation.participants.add(self.sender, self.receiver)
        
        return True, "Collaboration request accepted and conversation created"
    
    def reject(self):
        """Reject the collaboration request."""
        if self.status != 'pending':
            return False, "Request is not pending"
        
        self.status = 'rejected'
        self.responded_at = timezone.now()
        self.save()
        
        return True, "Collaboration request rejected"


class Conversation(models.Model):
    """
    Conversation Model - Private communication channel.
    
    TYPES:
    - Guidance: Mentor ↔ Student (from accepted GuidanceRequest)
    - Collaboration: Peer ↔ Peer (from accepted CollaborationRequest)
    
    RULES:
    - Only 2 participants (no group chats)
    - Created ONLY after request acceptance
    - Only participants can access
    - Soft delete support
    - One conversation per accepted request
    
    NOT INCLUDED:
    - No online indicators
    - No typing indicators
    - No voice/video
    - No public chat rooms
    """
    
    CONVERSATION_TYPE_CHOICES = (
        ('guidance', 'Guidance (Mentor ↔ Student)'),
        ('collaboration', 'Collaboration (Peer ↔ Peer)'),
    )
    
    # Type and Context
    conversation_type = models.CharField(
        max_length=20,
        choices=CONVERSATION_TYPE_CHOICES,
        db_index=True,
        help_text="Type of conversation"
    )
    
    # Link to Request
    guidance_request = models.OneToOneField(
        GuidanceRequest,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='conversation',
        help_text="Linked guidance request (if guidance type)"
    )
    collaboration_request = models.OneToOneField(
        CollaborationRequest,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='conversation',
        help_text="Linked collaboration request (if collaboration type)"
    )
    
    # Context
    circle = models.ForeignKey(
        'circles.Circle',
        on_delete=models.CASCADE,
        related_name='conversations',
        help_text="Circle context"
    )
    
    # Participants (always exactly 2)
    participants = models.ManyToManyField(
        User,
        related_name='conversations',
        help_text="Conversation participants (exactly 2)"
    )
    
    # Soft Delete
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether conversation is active"
    )
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Soft delete flag"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-last_message_at', '-created_at']
        indexes = [
            models.Index(fields=['conversation_type', '-created_at']),
            models.Index(fields=['is_active', 'is_deleted']),
            models.Index(fields=['-last_message_at']),
        ]
    
    def __str__(self):
        participants_names = " ↔ ".join([p.username for p in self.participants.all()])
        return f"{self.get_conversation_type_display()}: {participants_names}"
    
    def clean(self):
        """Validate conversation rules."""
        # Ensure exactly one request is linked
        if self.conversation_type == 'guidance' and not self.guidance_request:
            raise ValidationError("Guidance conversations must link to a GuidanceRequest")
        if self.conversation_type == 'collaboration' and not self.collaboration_request:
            raise ValidationError("Collaboration conversations must link to a CollaborationRequest")
    
    def is_participant(self, user):
        """Check if user is a participant."""
        return self.participants.filter(id=user.id).exists()
    
    def soft_delete(self):
        """Soft delete the conversation."""
        self.is_active = False
        self.is_deleted = True
        self.save()
    
    def get_title(self):
        """Get conversation title based on type."""
        if self.conversation_type == 'guidance' and self.guidance_request:
            return self.guidance_request.subject
        elif self.conversation_type == 'collaboration' and self.collaboration_request:
            return self.collaboration_request.project_topic
        return "Conversation"


class Message(models.Model):
    """
    Message Model - Individual messages within conversations.
    
    SIMPLE STRUCTURE:
    - Text messages only
    - No voice/video
    - No file attachments (use Resources in circles)
    - No reactions
    - No threading
    
    FOCUS:
    - Learning discussions
    - Mentorship guidance
    - Study collaboration
    """
    
    # Conversation
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text="Parent conversation"
    )
    
    # Sender
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        help_text="Message sender"
    )
    
    # Content
    content = models.TextField(
        max_length=2000,
        help_text="Message content"
    )
    
    # Read Status
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether message has been read"
    )
    
    # Soft Delete
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Soft delete flag"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        preview = self.content[:50] + '...' if len(self.content) > 50 else self.content
        return f"{self.sender.username}: {preview}"
    
    def save(self, *args, **kwargs):
        """Update conversation's last_message_at when saving."""
        super().save(*args, **kwargs)
        if not self.is_deleted:
            self.conversation.last_message_at = self.created_at
            self.conversation.save(update_fields=['last_message_at'])
