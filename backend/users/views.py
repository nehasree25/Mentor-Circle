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
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        
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
            return Response(serializer.data, status=status.HTTP_200_OK)
        
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
        from circles.models import Circle
        from discussions.models import Discussion

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
    Get user's dashboard data using ONLY REAL BACKEND DATA:
    - Joined circles (active, non-deleted)
    - Available mentors (up to 3, from /mentors/ endpoint)
    - Shared peers (up to 5, from /peers/ endpoint)
    - Recent activity (latest from circles/discussions)
    - All stats from actual database queries
    
    Requires JWT authentication.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        from circles.models import Circle, JoinRequest
        from discussions.models import Discussion
        from django.contrib.auth.models import User
        from django.db.models import Count, Q, F
        from users.serializers import UserDetailSerializer
        
        user = request.user
        
        # Ensure UserProfile exists
        UserProfile.objects.get_or_create(user=user)
        
        # =========================================================
        # 1. JOINED CIRCLES - Real backend data only
        # =========================================================
        joined_circles_qs = Circle.objects.filter(
            members=user,
            is_active=True,
            is_deleted=False
        ).annotate(
            members_count=Count('members', distinct=True),
            discussion_count=Count('discussions', distinct=True)
        )[:10]
        
        joined_circles = []
        for circle in joined_circles_qs:
            joined_circles.append({
                'id': circle.id,
                'name': circle.name,
                'description': circle.description,
                'members_count': circle.members_count,
                'discussion_count': circle.discussion_count,
                'created_at': circle.created_at,
            })
        
        # =========================================================
        # 2. AVAILABLE MENTORS - Real mentors from database (max 3)
        # =========================================================
        available_mentors_qs = User.objects.filter(
            profile__is_mentor=True,
            profile__role='mentor'
        ).exclude(id=user.id).select_related('profile').prefetch_related('joined_circles')[:3]
        
        available_mentors = UserDetailSerializer(available_mentors_qs, many=True).data
        
        # =========================================================
        # 3. SHARED PEERS - Real peers from database (max 5)
        # =========================================================
        # Get circles the user belongs to
        user_circles = Circle.objects.filter(
            Q(members=user) | Q(created_by=user),
            is_active=True,
            is_deleted=False
        ).values_list('id', flat=True)
        
        # Get peers who share at least one circle (exclude mentors, exclude self)
        shared_peers_qs = User.objects.filter(
            Q(joined_circles__id__in=user_circles) | Q(created_circles__id__in=user_circles)
        ).exclude(
            id=user.id
        ).exclude(
            profile__role='mentor'
        ).select_related('profile').annotate(
            shared_circles_count=Count(
                'joined_circles',
                filter=Q(joined_circles__id__in=user_circles),
                distinct=True
            )
        ).distinct()[:5]
        
        shared_peers = UserDetailSerializer(shared_peers_qs, many=True).data
        
        # =========================================================
        # 4. RECENT ACTIVITY - Real discussions from joined circles (max 4)
        # =========================================================
        recent_discussions = Discussion.objects.filter(
            circle__in=Circle.objects.filter(
                members=user,
                is_active=True,
                is_deleted=False
            )
        ).order_by('-created_at')[:4].select_related('user', 'circle')
        
        recent_activity = []
        for discussion in recent_discussions:
            recent_activity.append({
                'id': discussion.id,
                'type': 'circle_discussion',
                'description': f"{discussion.user.get_full_name() or discussion.user.username} posted in {discussion.circle.name}: {discussion.title}",
                'title': discussion.title,
                'created_at': discussion.created_at,
                'user': {
                    'id': discussion.user.id,
                    'name': discussion.user.get_full_name() or discussion.user.username,
                },
                'circle': {
                    'id': discussion.circle.id,
                    'name': discussion.circle.name,
                }
            })
        
        # =========================================================
        # 5. PENDING REQUESTS
        # =========================================================
        pending_requests = JoinRequest.objects.filter(
            user=user,
            status='pending'
        ).count()
        
        # =========================================================
        # 6. USER PROFILE DATA
        # =========================================================
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
            'available_mentors': available_mentors,
            'shared_peers': shared_peers,
            'recent_activity': recent_activity,
            'pending_requests': pending_requests,
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error in dashboard view for user {request.user.id}: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'An unexpected error occurred while fetching dashboard data',
                'details': str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


