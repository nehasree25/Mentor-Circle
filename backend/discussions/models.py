from django.db import models

class Discussion(models.Model):
    """
    Discussion Model - Handles messages within a circle.

    WORKFLOW:
    1. Users send messages in a circle
    2 a. Messages are organized by category
    3. Mentors and students can discuss STEM topics

    SECURITY:
    - Only circle members/mentors/creator can send messages
    - Soft delete support
    """

    CATEGORY_CHOICES = (
        ('general', 'General'),
        ('doubts', 'Doubts'),
        ('announcements', 'Announcements'),
        ('resources', 'Resources'),
        ('projects', 'Projects'),
    )

    # Relationships
    circle = models.ForeignKey(
        'circles.Circle',
        on_delete=models.CASCADE,
        related_name='discussions',
        help_text="Circle this discussion belongs to"
    )
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='discussions',
        help_text="User who sent the message"
    )

    # Message content
    content = models.TextField(
        max_length=2000,
        help_text="Discussion message content"
    )

    # Category
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default='general',
        db_index=True,
        help_text="Discussion category"
    )

    # Soft delete fields
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether the discussion is active"
    )
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether the discussion is soft deleted"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="When the message was sent"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the message was last updated"
    )

    class Meta:
        verbose_name = 'Discussion'
        verbose_name_plural = 'Discussions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['circle', 'category', '-created_at']),
            models.Index(fields=['is_active', 'is_deleted']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.circle.name} ({self.category})"

    def soft_delete(self):
        """Soft delete the discussion message"""
        self.is_active = False
        self.is_deleted = True
        self.save()
