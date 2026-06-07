from django.db import models
from django.contrib.auth.models import User
from django.core.validators import URLValidator, MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    """
    Extended user profile for MentorCircle platform.
    Stores additional information beyond Django's default User model.
    
    ROLE SYSTEM:
    - student: Can join circles, learn from peers and mentors
    - mentor: Can mentor in circles, provide guidance
    
    Only mentor-role users can be assigned as mentors in circles.
    """
    

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('mentor', 'Mentor'),
    )
    
    INTEREST_CHOICES = (
        ('math', 'Mathematics'),
        ('physics', 'Physics'),
        ('chemistry', 'Chemistry'),
        ('biology', 'Biology'),
        ('cs', 'Computer Science'),
        ('engineering', 'Engineering'),
        ('other', 'Other STEM'),
    )
    
    # User relationship (one-to-one)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Profile information
    bio = models.TextField(max_length=500, blank=True, help_text="Brief bio about yourself")
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    
    # Role and interests
    # SECURITY: role = 'mentor' is required to mentor in circles
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='student',
        db_index=True,
        help_text="User role determines circle participation level"
    )


    domain = models.CharField(
        max_length=50,
        choices=INTEREST_CHOICES,
        null=True,
        blank=True,

        help_text="Primary STEM domain of focus"
    )






    interests = models.CharField(
        max_length=200,
        blank=True,
        help_text="Comma-separated STEM interests (multiple topics)"
    )







    























    # Experience and skills
    experience_level = models.CharField(
        max_length=20,



        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
        default='beginner'
    )
    skills = models.TextField(blank=True, help_text="Comma-separated skills")
    years_of_experience = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Years of professional experience (for mentors)"
    )
    
    # Mentorship details
    is_mentor = models.BooleanField(default=False)
    mentorship_expertise = models.TextField(blank=True, help_text="Mentor expertise areas")

    # Learning goals
    learning_goals = models.TextField(blank=True, help_text="Personal learning objectives")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Peer Profile Fields (merged from peers app)
    AVAILABILITY_CHOICES = (
        ("available", "Available"),
        ("busy", "Busy"),
        ("away", "Away"),
        ("offline", "Offline"),
    )

    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    availability = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default="available",
        db_index=True
    )

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.role}"

