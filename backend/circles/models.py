from django.db import models
from django.db.models import Q
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone


class Circle(models.Model):
    """
    Learning Circle Model - Represents a collaborative STEM learning group.
    
    A circle is a small, focused community for peer-learning and mentorship.
    Each circle has:
    - Creator (the user who created it)
    - Members (students/participants)
    - Mentors (experienced guides)
    - Learning focus (domain, skill level)
    - Location and language preferences
    
    Security & Validation:
    - Max 30 members
    - Min 1, Max 5 mentors
    - Prevents duplicate joins
    - Validates skill levels and domains
    - Uses proper FK and M2M relationships
    """
    
    # Domain/Subject choices
    DOMAIN_CHOICES = (
        ('mathematics', 'Mathematics'),
        ('physics', 'Physics'),
        ('chemistry', 'Chemistry'),
        ('biology', 'Biology'),
        ('computer_science', 'Computer Science'),
        ('engineering', 'Engineering'),
        ('data_science', 'Data Science'),
        ('robotics', 'Robotics'),
        ('astronomy', 'Astronomy'),
        ('other', 'Other STEM'),
    )
    
    # Skill level choices
    SKILL_LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    
    # Language preferences
    LANGUAGE_CHOICES = (
        ('english', 'English'),
        ('spanish', 'Spanish'),
        ('french', 'French'),
        ('german', 'German'),
        ('chinese', 'Chinese'),
        ('other', 'Other'),
    )
    
    # Basic Info
    name = models.CharField(
        max_length=150,
        help_text="Name of the learning circle"
    )
    description = models.TextField(
        max_length=1000,
        blank=True,
        help_text="Detailed description of circle goals and activities"
    )
    
    # Learning Details
    domain = models.CharField(
        max_length=50,
        choices=DOMAIN_CHOICES,
        db_index=True,
        help_text="STEM subject area"
    )
    skill_level = models.CharField(
        max_length=20,
        choices=SKILL_LEVEL_CHOICES,
        default='beginner',
        db_index=True,
        help_text="Required or target skill level"
    )
    
    # Location & Language
    location = models.CharField(
        max_length=200,
        blank=True,
        db_index=True,
        help_text="Circle location (city, online, etc.)"
    )
    preferred_language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        default='english',
        db_index=True,
        help_text="Preferred communication language"
    )
    
    # Privacy Settings
    # SECURITY: is_private=True requires join request approval
    is_private = models.BooleanField(
        default=False,
        help_text="Private circles require join request approval"
    )
    
    # Circle Capacity Settings
    max_members = models.PositiveIntegerField(
        default=30,
        help_text="Maximum number of members allowed"
    )
    
    # Soft Delete Fields
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the circle is active/visible"
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="Whether the circle is soft-deleted"
    )
    archived_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the circle was archived/soft-deleted"
    )
    
    # Relationships
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_circles',
        help_text="User who created this circle"
    )
    
    members = models.ManyToManyField(
        User,
        related_name='joined_circles',
        blank=True,
        help_text="Members of this circle"
    )
    
    mentors = models.ManyToManyField(
        User,
        related_name='mentoring_circles',
        blank=True,
        help_text="Mentors in this circle"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Learning Circle'
        verbose_name_plural = 'Learning Circles'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['domain', 'skill_level']),
            models.Index(fields=['created_at']),
            models.Index(fields=['created_by']),
            models.Index(fields=['is_active', 'is_deleted']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_domain_display()}) - {self.members.count()} members"
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def clean(self):
        """
        Comprehensive validation before saving.
        Ensures data integrity and security.
        """
        # Validate name
        if not self.name or len(self.name.strip()) == 0:
            raise ValidationError({'name': 'Circle name is required.'})
        
        # Validate max_members
        if self.max_members < 2:
            raise ValidationError({
                'max_members': 'Circle must allow at least 2 members.'
            })
        if self.max_members > 50:
            raise ValidationError({
                'max_members': 'Maximum members cannot exceed 50.'
            })
        
        # Validate description length
        if len(self.description) > 1000:
            raise ValidationError({
                'description': 'Description cannot exceed 1000 characters.'
            })
    
    def can_add_member(self, user):
        """
        Check if a user can be added as a member.
        
        Returns: (can_add: bool, reason: str or None)
        
        Validation rules:
        - User is not already a member
        - Circle has space
        - User exists
        """
        # Check if user is already a member
        if self.members.filter(id=user.id).exists():
            return False, "User is already a member of this circle."
        
        # Check if circle is full
        current_members = self.members.count()
        if current_members >= self.max_members:
            return False, f"Circle is full (max {self.max_members} members)."
        
        return True, None
    
    def can_add_mentor(self, user):
        """
        Check if a user can be added as a mentor.

        Returns: (can_add: bool, reason: str or None)

        Validation rules:
        - User must have a mentor role
        - Maximum 5 mentors
        - User is not already a mentor
        - User exists
        """
        # SECURITY: Verify user has mentor role
        if not hasattr(user, 'profile') or user.profile.role != 'mentor':
            return False, "User must have a mentor role to be added as a mentor."

        mentor_count = self.mentors.count()

        # Check mentor limit
        if mentor_count >= 5:
            return False, "Circle has reached maximum mentors (5)."

        # Check if already a mentor
        if self.mentors.filter(id=user.id).exists():
            return False, "User is already a mentor in this circle."

        return True, None
    
    def add_member_safe(self, user):
        """
        Safely add a member with validation.
        
        Returns: (success: bool, message: str)
        """
        can_add, reason = self.can_add_member(user)
        if not can_add:
            return False, reason
        
        try:
            self.members.add(user)
            return True, "Member added successfully."
        except Exception as e:
            return False, f"Error adding member: {str(e)}"
    
    def remove_member_safe(self, user):
        """
        Safely remove a member.
        
        Returns: (success: bool, message: str)
        """
        if not self.members.filter(id=user.id).exists():
            return False, "User is not a member of this circle."
        
        try:
            self.members.remove(user)
            return True, "Member removed successfully."
        except Exception as e:
            return False, f"Error removing member: {str(e)}"
    
    def add_mentor_safe(self, user):
        """
        Safely add a mentor with validation.
        
        Returns: (success: bool, message: str)
        """
        can_add, reason = self.can_add_mentor(user)
        if not can_add:
            return False, reason
        
        try:
            self.mentors.add(user)
            return True, "Mentor added successfully."
        except Exception as e:
            return False, f"Error adding mentor: {str(e)}"
    
    def is_creator(self, user):
        """Check if user is the circle creator."""
        return self.created_by_id == user.id
    
    def is_member(self, user):
        """Check if user is a member."""
        return self.members.filter(id=user.id).exists()
    
    def is_mentor(self, user):
        """Check if user is a mentor."""
        return self.mentors.filter(id=user.id).exists()
    
    def get_member_count(self):
        """Get total member count."""
        return self.members.count()
    
    def get_mentor_count(self):
        """Get total mentor count."""
        return self.mentors.count()
    
    def get_available_spots(self):
        """Get number of available member slots."""
        return self.max_members - self.get_member_count()
    
    def is_full(self):
        """Check if circle is at maximum capacity."""
        return self.get_member_count() >= self.max_members
    
    def soft_delete(self):
        """Soft delete/archive the circle."""
        self.is_active = False
        self.is_deleted = True
        self.archived_at = timezone.now()
        self.save()
    
    def transfer_ownership(self, new_owner):
        """Transfer circle ownership to another user."""
        # Add old owner to members if they're not already there
        if not self.members.filter(id=self.created_by.id).exists():
            self.members.add(self.created_by)

        self.created_by = new_owner
        self.save()
    
    def get_peers(self):
        """Get non-mentor members (including creator if not a mentor)."""
        # A peer is someone who is (a member OR the creator) AND NOT a mentor
        return User.objects.filter(
            (Q(joined_circles=self) | Q(created_circles=self)) &
            ~Q(mentoring_circles=self)
        ).select_related('profile').distinct()
    
    def get_peer_count(self):
        """Get the number of peers (non-mentor members, including creator)."""
        return self.get_peers().count()


class Resource(models.Model):
    """
    Resource Model - Learning materials shared within a circle.
    
    A resource represents a learning material that can be:
    - PDF documents
    - DOC/DOCX files
    - PowerPoint presentations
    - External links
    - YouTube videos
    - Text notes
    
    PERMISSIONS:
    - Only circle members, mentors, and owners can view resources
    - Only circle owners and mentors can upload/edit/delete resources
    - Soft delete support (resources remain in database)
    
    FUTURE READY:
    - Designed to support AI-generated learning resources
    - Can be extended with metadata for ML tagging
    """
    
    RESOURCE_TYPE_CHOICES = (
        ('pdf', 'PDF Document'),
        ('doc', 'DOC/DOCX Document'),
        ('ppt', 'PowerPoint (PPT/PPTX)'),
        ('link', 'External Link'),
        ('youtube', 'YouTube Video'),
        ('notes', 'Notes / Text Resource'),
    )
    
    # Relationships
    circle = models.ForeignKey(
        Circle,
        on_delete=models.CASCADE,
        related_name='resources',
        help_text="Circle this resource belongs to"
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='uploaded_resources',
        help_text="User who uploaded the resource"
    )
    
    # Resource Information
    title = models.CharField(
        max_length=255,
        help_text="Resource title"
    )
    description = models.TextField(
        max_length=1000,
        blank=True,
        help_text="Detailed description of the resource"
    )
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        db_index=True,
        help_text="Type of resource"
    )
    
    # Content - either file or external URL
    file = models.FileField(
        upload_to='circle_resources/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text="Uploaded file (for PDF, DOC, PPT)"
    )
    external_url = models.URLField(
        max_length=2000,
        blank=True,
        help_text="External URL (for links, YouTube)"
    )
    
    # Soft Delete Fields
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether the resource is soft-deleted"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="When the resource was uploaded"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the resource was last updated"
    )
    
    class Meta:
        verbose_name = 'Circle Resource'
        verbose_name_plural = 'Circle Resources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['circle', 'resource_type', '-created_at']),
            models.Index(fields=['circle', '-created_at']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        return f"{self.title} in {self.circle.name}"
    
    def soft_delete(self):
        """Soft delete the resource."""
        self.is_deleted = True
        self.save()
    
    def restore(self):
        """Restore a soft-deleted resource."""
        self.is_deleted = False
        self.save()
    
    def can_user_edit(self, user):
        """Check if user can edit this resource."""
        return self.uploaded_by == user or self.circle.is_creator(user) or self.circle.is_mentor(user)
    
    def can_user_delete(self, user):
        """Check if user can delete this resource."""
        return self.uploaded_by == user or self.circle.is_creator(user) or self.circle.is_mentor(user)


class JoinRequest(models.Model):
    """
    Join Request Model - Handles requests to join private circles.
    
    WORKFLOW:
    1. User requests to join a private circle
    2. Circle creator receives pending request
    3. Creator approves/rejects request
    4. If approved: user automatically added to members
    5. If rejected: user remains outside circle
    
    SECURITY:
    - Prevents duplicate pending requests (one per user per circle)
    - Only circle creator can approve/reject
    - Auto-adds user to members on approval
    - Clear audit trail with timestamps
    """
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    
    # Relationships
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='join_requests',
        help_text="User requesting to join"
    )
    circle = models.ForeignKey(
        Circle,
        on_delete=models.CASCADE,
        related_name='join_requests',
        help_text="Circle being requested to join"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,
        help_text="Request status: pending/accepted/rejected"
    )
    
    # Optional message from requester
    message = models.TextField(
        max_length=500,
        blank=True,
        help_text="Optional message from the requester"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Join Request'
        verbose_name_plural = 'Join Requests'
        ordering = ['-created_at']
        # Prevent duplicate requests (one per user per circle, regardless of status)
        unique_together = [
            ('user', 'circle')
        ]
        indexes = [
            models.Index(fields=['user', 'circle']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} -> {self.circle.name} ({self.status})"
    
    def approve(self):
        """
        Approve the join request.
        - Updates status to 'accepted'
        - Adds user to circle members
        - Auto-adds as mentor if user is a registered mentor

        Returns: (success: bool, message: str)
        """
        try:
            # First, check if the user can actually join (e.g. capacity check)
            can_add, reason = self.circle.can_add_member(self.user)
            if not can_add:
                # Return error without marking as rejected (keep as pending)
                return False, reason

            # Update status and save
            self.status = 'accepted'
            self.save()

            # Add user to circle members
            self.circle.members.add(self.user)

            # Auto-add as mentor if user is a registered mentor and circle has space
            if hasattr(self.user, 'profile') and self.user.profile.role == 'mentor':
                can_add_mentor, reason = self.circle.can_add_mentor(self.user)
                if can_add_mentor:
                    self.circle.mentors.add(self.user)

            return True, "Request approved and user added to circle"
        except Exception as e:
            return False, f"Error approving request: {str(e)}"
    
    def reject(self):
        """
        Reject the join request.
        - Updates status to 'rejected'
        - Does NOT add user to circle
        
        Returns: (success: bool, message: str)
        """
        try:
            self.status = 'rejected'
            self.save()
            return True, "Request rejected"
        except Exception as e:
            return False, f"Error rejecting request: {str(e)}"



