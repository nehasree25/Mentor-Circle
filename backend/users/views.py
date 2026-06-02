from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from drf_spectacular.utils import extend_schema

from .serializers import (
    SignupSerializer, LoginSerializer, UserDetailSerializer, UserProfileSerializer
)
from .models import UserProfile


# ============================================================================
# Signup View - Register new user
# ============================================================================

@extend_schema(
    operation_id="auth_signup",
    description="Register a new user account",
    request=SignupSerializer,
    responses={201: UserDetailSerializer},
    tags=["Authentication"],
)
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    User registration endpoint.
    Creates a new user account and returns JWT tokens.
    
    Request body requires:
    - username: Unique username
    - email: User email address
    - first_name: User's first name
    - last_name: User's last name
    - password: Password (min 8 characters)
    - password2: Password confirmation
    
    Returns JWT access and refresh tokens on success.
    """
    
    if request.method == 'POST':
        serializer = SignupSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create the user
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# Login View - Authenticate user and return JWT tokens
# ============================================================================

@extend_schema(
    operation_id="auth_login",
    description="Authenticate user with credentials",
    request=LoginSerializer,
    responses={200: UserDetailSerializer},
    tags=["Authentication"],
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    User login endpoint.
    Authenticates user with username and password, returns JWT tokens.
    
    Request body requires:
    - username: User's username
    - password: User's password
    
    Returns JWT access and refresh tokens on successful authentication.
    """
    
    if request.method == 'POST':
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if user is not None:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'Login successful!',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid username or password.'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# Profile View - Get authenticated user's profile
# ============================================================================

@extend_schema(
    operation_id="auth_profile",
    description="Get or update authenticated user's profile",
    request=UserDetailSerializer,
    responses={200: UserDetailSerializer},
    tags=["Profile"],
)
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    User profile endpoint.
    GET: Returns authenticated user's complete profile information
    PUT: Updates user's profile information
    
    Requires JWT authentication via Authorization header.
    """
    
    user = request.user
    
    if request.method == 'GET':
        # Retrieve user profile
        serializer = UserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Update user profile
        user_serializer = UserDetailSerializer(
            user,
            data=request.data,
            partial=True
        )
        
        if user_serializer.is_valid():
            user_serializer.save()
            return Response({
                'message': 'Profile updated successfully!',
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# UserProfile View - Get or update UserProfile
# ============================================================================

@extend_schema(
    operation_id="auth_userprofile",
    description="Get or update authenticated user's UserProfile",
    request=UserProfileSerializer,
    responses={200: UserProfileSerializer},
    tags=["Profile"],
)
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def userprofile(request):
    """
    UserProfile endpoint.
    GET: Returns authenticated user's UserProfile
    PUT/PATCH: Updates user's UserProfile
    
    Requires JWT authentication via Authorization header.
    """
    
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = UserProfileSerializer(
            user_profile,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'UserProfile updated successfully!',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# Refresh Token View - Get new access token using refresh token
# ============================================================================

@extend_schema(
    operation_id="auth_refresh",
    description="Refresh JWT access token using refresh token",
    responses={200: {"type": "object"}},
    tags=["Authentication"],
)
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresh JWT token endpoint.
    Generates a new access token using a valid refresh token.
    
    Request body requires:
    - refresh: Valid refresh token
    
    Returns new access token and optionally rotated refresh token.
    """
    
    if request.method == 'POST':
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Invalid refresh token: {str(e)}'
            }, status=status.HTTP_401_UNAUTHORIZED)


# ============================================================================
# Logout View - Blacklist refresh token
# ============================================================================

@extend_schema(
    operation_id="auth_logout",
    description="Logout user and blacklist refresh token",
    responses={200: {"type": "object"}},
    tags=["Authentication"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    User logout endpoint.
    
    IMPORTANT: Blacklists the refresh token to prevent further use.
    After logout, the token is added to the blacklist database.
    Any attempt to use a blacklisted token will be rejected.
    
    Request body requires:
    - refresh: User's refresh token to blacklist
    
    The token is PERMANENTLY invalidated and cannot be reused.
    User must login again to get new tokens.
    
    Requires JWT authentication (access token).
    
    Example request:
    POST /api/auth/logout/
    Authorization: Bearer <access_token>
    {
        "refresh": "<refresh_token>"
    }
    
    Response on success (200 OK):
    {
        "message": "Logout successful! Token has been blacklisted."
    }
    """
    
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required for logout.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create RefreshToken object and blacklist it
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Logout successful! Token has been blacklisted.',
                'detail': 'You have been logged out. Your refresh token is now invalid.'
            }, status=status.HTTP_200_OK)
            
        except TokenError as e:
            # Token is invalid or already blacklisted
            return Response({
                'error': 'Invalid or expired token.',
                'detail': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': 'Error during logout.',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# User List View - Get all users (for finding peers)
# ============================================================================

@extend_schema(
    operation_id="auth_users_list",
    description="Get list of users for peer discovery",
    responses={200: UserDetailSerializer(many=True)},
    tags=["Users"],
    parameters=[],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """
    Get list of users (for peer discovery).
    Returns all users except the authenticated user.
    
    Query parameters:
    - search: Search by username, first_name, or last_name (case-insensitive)
    - role: Filter by role (student, mentor, both)
    
    Requires JWT authentication.
    """
    
    users = User.objects.exclude(id=request.user.id)
    
    # Search functionality
    search_query = request.query_params.get('search', '')
    if search_query:
        users = users.filter(
            Q(username__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        )
    
    # Role filter
    role_filter = request.query_params.get('role', '')
    if role_filter:
        users = users.filter(profile__role=role_filter)
    
    serializer = UserDetailSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================================
# Profile Stats View - Get user's profile statistics
# ============================================================================

@extend_schema(
    operation_id="profile_stats",
    description="Get user's profile statistics (joined circles, mentor circles, etc.)",
    responses={200: {"type": "object"}},
    tags=["Profile"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_stats(request):
    """Get user's profile stats"""
    try:
        from circles.models import Circle, Discussion

        user = request.user

        joined_circles_count = Circle.objects.filter(
            members=user,
            is_active=True,
            is_deleted=False
        ).count()

        mentor_circles_count = Circle.objects.filter(
            mentors=user,
            is_active=True,
            is_deleted=False
        ).count()

        peer_collaborations = Circle.objects.filter(
            members=user,
            is_active=True,
            is_deleted=False
        ).count()  # Can be refined later

        discussions_count = Discussion.objects.filter(
            user=user,
            is_active=True,
            is_deleted=False
        ).count()

        resources_shared = 0  # Placeholder for now

        return Response({
            'joined_circles': joined_circles_count,
            'mentor_circles': mentor_circles_count,
            'peer_collaborations': peer_collaborations,
            'discussions': discussions_count,
            'resources_shared': resources_shared
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Dashboard View - Get user's dashboard data
# ============================================================================

@extend_schema(
    operation_id="dashboard_summary",
    description="Get user's dashboard summary with circles, sessions, and recommendations",
    responses={200: {"type": "object"}},
    tags=["Dashboard"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """
    Get user's dashboard data including:
    - Joined circles
    - Mentor sessions
    - Recommendations
    - Learning progress
    - Discussion activity
    
    Requires JWT authentication.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        from circles.models import Circle, JoinRequest
        
        user = request.user
        
        # Ensure UserProfile exists
        UserProfile.objects.get_or_create(user=user)
        
        # Get user's circles (active, non-deleted only)
        joined_circles_queryset = Circle.objects.filter(
            members=user,
            is_active=True,
            is_deleted=False
        )[:5]
        joined_circles = []
        for circle in joined_circles_queryset:
            joined_circles.append({
                'id': circle.id,
                'name': circle.name,
                'description': circle.description,
                'members_count': circle.members.count(),
                'created_at': circle.created_at,
            })
        
        # Get pending join requests
        pending_requests = JoinRequest.objects.filter(
            user=user,
            status='pending'
        ).count()
        
        # Get user profile data
        user_profile_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
        }
        
        return Response({
            'user': user_profile_data,
            'joined_circles': joined_circles,
            'pending_requests': pending_requests,
            'mentor_sessions': [],  # Placeholder
            'recommendations': [],  # Placeholder
            'learning_progress': [],  # Placeholder
            'discussion_activity': [],  # Placeholder
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error in dashboard view for user {request.user.id}: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'An unexpected error occurred while fetching dashboard data',
                'details': str(e),
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                },
                'joined_circles': [],
                'pending_requests': 0,
                'mentor_sessions': [],
                'recommendations': [],
                'learning_progress': [],
                'discussion_activity': [],
            },
            status=status.HTTP_200_OK  # Return 200 even with error, just with fallback data
        )


