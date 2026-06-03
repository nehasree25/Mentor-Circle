from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for Django's User model.
    Used for user authentication and profile information.
    """
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model.
    Extended user information specific to MentorCircle.
    """
    
    # Nest user information
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = (
            'id', 'user', 'bio', 'profile_picture', 'role', 'interests',
            'experience_level', 'skills', 'years_of_experience', 'is_mentor', 
            'mentorship_expertise',
            'learning_goals', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class SignupSerializer(serializers.ModelSerializer):
    """
    Serializer for user signup/registration.
    Creates a new User and associated UserProfile.
    Includes comprehensive password validation and hashing.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        help_text="Password must be at least 8 characters and contain uppercase, lowercase, numbers"
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        help_text="Confirm password"
    )
    
    # Profile fields (optional)
    role = serializers.ChoiceField(
        choices=UserProfile.ROLE_CHOICES,
        required=False,
        default='student'
    )
    interests = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True
    )
    experience_level = serializers.ChoiceField(
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
        required=False,
        default='beginner'
    )
    skills = serializers.CharField(required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(
    required=False,
    min_value=0,
    allow_null=True
    )
    is_mentor = serializers.BooleanField(required=False, default=False)
    mentorship_expertise = serializers.CharField(required=False, allow_blank=True)
    learning_goals = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'password2',
            'role', 'interests', 'experience_level',
            'skills', 'years_of_experience', 'is_mentor',
            'mentorship_expertise', 'learning_goals', 'bio'
        )
        read_only_fields = ('id',)
        extra_kwargs = {
            'username': {
                'help_text': 'Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'
            },
            'email': {
                'help_text': 'A unique email address for account recovery'
            },
        }
    
    def validate_password(self, value):
        """
        Validate password strength using Django's built-in validators.
        Ensures: minimum length, not all numeric, not common passwords, etc.
        Passwords are ALWAYS hashed - never stored in plain text.
        """
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, data):
        """
        Validate that passwords match and meet security requirements.
        """
        password = data.get('password')
        password2 = data.get('password2')
        
        if password != password2:
            raise serializers.ValidationError({
                'password': 'Passwords do not match.'
            })
        
        # Check username is not used as password
        if data.get('username').lower() in password.lower():
            raise serializers.ValidationError({
                'password': 'Password cannot contain your username.'
            })
        
        return data
    
    def create(self, validated_data):
        """
        Create a new User with properly HASHED password and associated UserProfile.
        IMPORTANT: User.objects.create_user() automatically hashes the password.
        The password is NEVER stored in plain text.
        """
        # Extract profile fields
        profile_fields = {}
        profile_field_names = [
            'role', 'interests', 'experience_level', 'skills',
            'years_of_experience', 'is_mentor', 'mentorship_expertise',
            'learning_goals', 'bio'
        ]
        for field in profile_field_names:
            if field in validated_data:
                profile_fields[field] = validated_data.pop(field)
        
        # Remove password2 as it's not part of User model
        validated_data.pop('password2')
        
        # If role is mentor, set is_mentor to True
        if profile_fields.get('role') == 'mentor':
            profile_fields['is_mentor'] = True
        
        # Create the user with HASHED password (create_user() handles hashing)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']  # create_user() hashes this automatically
        )
        
        # Get or create associated UserProfile and update fields
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        for key, value in profile_fields.items():
            if value is not None:
                setattr(user_profile, key, value)
        user_profile.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Accepts username/email and password.
    """
    
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """
        Basic validation for login credentials.
        """
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise serializers.ValidationError(
                "Both username and password are required."
            )
        
        return data


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for user profile information.
    Used for the profile endpoint to return complete user data.
    """
    
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile', 'date_joined')
        read_only_fields = ('id', 'date_joined')
