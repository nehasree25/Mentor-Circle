"""
Views for Circles System.

Implements secure, production-grade API endpoints for:
- Circle CRUD operations
- Public/Private join logic
- Join request workflow
- Member/mentor management
- Search and filtering
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema

from .models import Circle, JoinRequest, Resource
from discussions.models import Discussion
from .serializers import (
    CircleCreateSerializer, CircleListSerializer, CircleDetailSerializer,
    JoinRequestCreateSerializer, JoinRequestListSerializer, JoinRequestDetailSerializer,
    DiscussionSerializer, CreateDiscussionSerializer, UserBasicSerializer,
    ResourceSerializer, ResourceCreateSerializer, ResourceUpdateSerializer
)
from .permissions import (
    IsCircleCreator, CanJoinCircle, CanLeaveCircle, CanManageJoinRequest
)


# ============================================================================
# Utility Functions
# ============================================================================

def get_circle_or_404(circle_id):
    """Safely retrieve a circle or return None."""
    try:
        return Circle.objects.get(id=circle_id)
    except Circle.DoesNotExist:
        return None


def get_join_request_or_404(request_id):
    """Safely retrieve a join request or return None."""
    try:
        return JoinRequest.objects.get(id=request_id)
    except JoinRequest.DoesNotExist:
        return None


# ============================================================================
# CREATE CIRCLE - POST /api/circles/create/
# ============================================================================

@extend_schema(
    operation_id="circles_create",
    description="Create a new learning circle",
    request=CircleCreateSerializer,
    responses={201: CircleDetailSerializer},
    tags=["Circles"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_circle(request):
    """
    Create a new learning circle.
    
    Features:
    - Creator automatically becomes a member
    - Can create public (instant join) or private (request approval) circles
    - Supports STEM domains, skill levels, languages
    - Validates all fields
    
    Request body:
    {
        "name": "Python for Beginners",
        "description": "Learning Python together",
        "domain": "computer_science",
        "skill_level": "beginner",
        "location": "Online",
        "preferred_language": "english",
        "max_members": 30,
        "is_private": false
    }
    """
    serializer = CircleCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        circle = serializer.save()
        detail_serializer = CircleDetailSerializer(
            circle,
            context={'request': request}
        )
        
        return Response({
            'message': 'Circle created successfully!',
            'circle': detail_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# LIST ALL CIRCLES - GET /api/circles/
# ============================================================================

@extend_schema(
    operation_id="circles_list",
    description="Get list of all circles with pagination",
    responses={200: CircleListSerializer(many=True)},
    tags=["Circles"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def circle_list(request):
    """
    Get paginated list of all active, non-deleted circles.
    
    Query Parameters:
    - page: Page number (default 1)
    - limit: Results per page (default 20)
    
    Shows both public and private circles.
    """
    circles = Circle.objects.filter(is_active=True, is_deleted=False).annotate(
        member_count=Count('members', distinct=True),
        mentor_count=Count('mentors', distinct=True)
    ).prefetch_related(
        'created_by__profile'
    )
    
    paginator = PageNumberPagination()
    limit = request.query_params.get('limit', 20)
    try:
        paginator.page_size = int(limit)
    except (ValueError, TypeError):
        paginator.page_size = 20

    paginated_circles = paginator.paginate_queryset(circles, request)
    serializer = CircleListSerializer(
        paginated_circles,
        many=True,
        context={'request': request}
    )
    
    return paginator.get_paginated_response(serializer.data)


# ============================================================================
# GET CIRCLE DETAILS - GET /api/circles/<id>/
# ============================================================================

@extend_schema(
    operation_id="circles_detail",
    description="Get detailed information about a specific circle",
    responses={200: CircleDetailSerializer},
    tags=["Circles"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def circle_detail(request, circle_id):
    """
    Get full details of a specific active, non-deleted circle.
    
    Returns:
    - Circle information
    - Complete member list
    - Complete mentor list
    - User membership status
    - User request status
    
    Path Parameters:
    - circle_id: ID of the circle
    """
    try:
        circle = Circle.objects.filter(is_active=True, is_deleted=False).prefetch_related(
            'members__profile',
            'mentors__profile',
            'created_by__profile'
        ).get(id=circle_id)
    except Circle.DoesNotExist:
        return Response(
            {'error': 'Circle not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CircleDetailSerializer(
        circle,
        context={'request': request}
    )
    
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================================
# JOIN CIRCLE - POST /api/circles/join/<id>/
# ============================================================================

@extend_schema(
    operation_id="circles_join",
    description="Join a circle (instant for public, request for private)",
    responses={200: CircleDetailSerializer},
    tags=["Circles"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_circle(request, circle_id):
    """
    Join a circle.
    
    Logic:
    1. If circle.is_private == False:
       - User instantly joins as member
       - Returns 200 with circle details
    
    2. If circle.is_private == True:
       - Creates pending join request
       - Returns 200 with "Request pending" message
       - Awaits creator approval
    
    Validation:
    - User is not already a member
    - User doesn't have pending request
    - Circle is not full (for instant join)
    - User is not the creator
    
    Path Parameters:
    - circle_id: ID of the circle to join
    """
    user = request.user
    circle = get_circle_or_404(circle_id)
    
    if not circle:
        return Response(
            {'error': 'Circle not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # SECURITY: Prevent creator from joining their own circle
    if circle.is_creator(user):
        return Response(
            {'error': 'You are the creator of this circle'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if already a member
    if circle.is_member(user):
        return Response(
            {'error': 'You are already a member of this circle'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check for existing pending request
    pending_request = JoinRequest.objects.filter(
        user=user,
        circle=circle,
        status='pending'
    ).first()
    
    if pending_request:
        return Response(
            {'error': 'You already have a pending request for this circle'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # LOGIC: Public vs Private circles
    if not circle.is_private:
        # PUBLIC CIRCLE: Instant join
        can_join, reason = circle.can_add_member(user)
        
        if not can_join:
            return Response(
                {'error': reason},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        circle.members.add(user)
        # Auto-add as mentor if user is a registered mentor
        if hasattr(user, 'profile') and user.profile.role == 'mentor':
            circle.mentors.add(user)
        
        detail_serializer = CircleDetailSerializer(
            circle,
            context={'request': request}
        )
        
        return Response({
            'message': 'Successfully joined circle!',
            'circle': detail_serializer.data
        }, status=status.HTTP_200_OK)
    
    else:
        # PRIVATE CIRCLE: Create join request
        join_request = JoinRequest.objects.create(
            user=user,
            circle=circle,
            message=request.data.get('message', '')
        )
        
        return Response({
            'message': 'Join request submitted! Awaiting creator approval.',
            'request_id': join_request.id,
            'status': 'pending'
        }, status=status.HTTP_200_OK)





# ============================================================================
# SEARCH CIRCLES - GET /api/circles/search/
# ============================================================================

@extend_schema(
    operation_id="circles_search",
    description="Search and filter circles",
    responses={200: CircleListSerializer(many=True)},
    tags=["Circles"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_circles(request):
    """
    Search and filter active, non-deleted circles.
    
    Query Parameters (all optional):
    - search: Search in name and description
    - domain: Filter by STEM subject
    - skill_level: Filter by skill level (beginner/intermediate/advanced)
    - location: Filter by location (case-insensitive)
    - preferred_language: Filter by language
    - page: Page number
    - limit: Results per page
    
    Examples:
    - /api/circles/search/?domain=computer_science
    - /api/circles/search/?search=Python
    - /api/circles/search/?location=Online&skill_level=beginner
    """
    circles = Circle.objects.filter(is_active=True, is_deleted=False).annotate(
        member_count=Count('members', distinct=True),
        mentor_count=Count('mentors', distinct=True)
    ).prefetch_related(
        'created_by__profile'
    )
    
    # Text search in name and description
    search_query = request.query_params.get('search')
    if search_query:
        circles = circles.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    # Filter by domain
    domain = request.query_params.get('domain')
    if domain:
        circles = circles.filter(domain=domain)
    
    # Filter by skill level
    skill_level = request.query_params.get('skill_level')
    if skill_level:
        circles = circles.filter(skill_level=skill_level)
    
    # Filter by location (case-insensitive)
    location = request.query_params.get('location')
    if location:
        circles = circles.filter(location__icontains=location)
    
    # Filter by language
    language = request.query_params.get('preferred_language')
    if language:
        circles = circles.filter(preferred_language=language)
    
    # Pagination
    paginator = PageNumberPagination()
    limit = request.query_params.get('limit', 20)
    try:
        paginator.page_size = int(limit)
    except (ValueError, TypeError):
        paginator.page_size = 20

    paginated_circles = paginator.paginate_queryset(circles, request)
    serializer = CircleListSerializer(
        paginated_circles,
        many=True,
        context={'request': request}
    )
    
    return paginator.get_paginated_response(serializer.data)


# ============================================================================
# MY CIRCLES - GET /api/circles/my-circles/
# ============================================================================

@extend_schema(
    operation_id="circles_my_circles",
    description="Get circles where user is member, creator, or mentor",
    responses={200: CircleListSerializer(many=True)},
    tags=["Circles"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_circles(request):
    """
    Get active, non-deleted circles where user is a member, creator, or mentor.
    
    Returns all circles the user is involved in.
    """
    user = request.user
    
    # Get circles where user is member, creator, or mentor
    circles = Circle.objects.filter(
        Q(is_active=True, is_deleted=False),
        Q(members=user) | Q(created_by=user) | Q(mentors=user)
    ).distinct().annotate(
        member_count=Count('members', distinct=True),
        mentor_count=Count('mentors', distinct=True)
    ).prefetch_related(
        'created_by__profile'
    )
    
    # Pagination
    paginator = PageNumberPagination()
    limit = request.query_params.get('limit', 20)
    try:
        paginator.page_size = int(limit)
    except (ValueError, TypeError):
        paginator.page_size = 20

    paginated_circles = paginator.paginate_queryset(circles, request)
    serializer = CircleListSerializer(
        paginated_circles,
        many=True,
        context={'request': request}
    )
    
    return paginator.get_paginated_response(serializer.data)


# ============================================================================
# JOIN REQUEST ENDPOINTS
# ============================================================================

# CREATE JOIN REQUEST - POST /api/circles/request/<id>/

@extend_schema(
    operation_id="join_request_create",
    description="Submit a join request for a private circle",
    request=JoinRequestCreateSerializer,
    responses={201: JoinRequestDetailSerializer},
    tags=["Join Requests"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_join_circle(request, circle_id):
    """
    Submit a join request for a private circle.
    
    Only works for private circles (is_private=True).
    Public circles use the /join/ endpoint instead.
    
    Request body:
    {
        "message": "I'm interested in learning Python"
    }
    
    Returns:
    - 201: Join request created successfully
    - 400: Already a member / Already pending request / User is creator
    - 404: Circle not found
    """
    circle = get_circle_or_404(circle_id)
    
    if not circle:
        return Response(
            {'error': 'Circle not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user is already a member
    if circle.is_member(request.user):
        return Response(
            {'error': 'You are already a member of this circle'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user is the creator
    if circle.is_creator(request.user):
        return Response(
            {'error': 'You are the creator of this circle'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = JoinRequestCreateSerializer(
        data=request.data,
        context={'request': request, 'circle': circle}
    )
    
    if serializer.is_valid():
        join_request = serializer.save()
        detail_serializer = JoinRequestDetailSerializer(join_request)
        
        return Response({
            'message': 'Join request submitted successfully!',
            'request': detail_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# APPROVE JOIN REQUEST - POST /api/circles/request/<request_id>/approve/

@extend_schema(
    operation_id="join_request_approve",
    description="Approve a pending join request (circle creator only)",
    responses={200: JoinRequestDetailSerializer},
    tags=["Join Requests"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_join_request(request, request_id):
    """
    Approve a pending join request.
    
    SECURITY: Only the circle creator can approve requests.
    
    Action:
    - Updates request status to 'accepted'
    - Adds user to circle members
    - User can now access circle
    
    Returns:
    - 200: Request approved successfully
    - 400: Request already processed / User doesn't have capacity
    - 403: Only creator can approve
    - 404: Request not found
    """
    join_request = get_join_request_or_404(request_id)
    
    if not join_request:
        return Response(
            {'error': 'Join request not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # SECURITY: Only creator can approve
    if join_request.circle.created_by != request.user:
        return Response(
            {'error': 'Only the circle creator can approve requests'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if request is still pending
    if join_request.status != 'pending':
        return Response(
            {'error': f'Request is already {join_request.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Approve and add to members
    success, message = join_request.approve()
    
    if not success:
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    detail_serializer = JoinRequestDetailSerializer(join_request)
    
    return Response({
        'message': 'Join request approved!',
        'request': detail_serializer.data
    }, status=status.HTTP_200_OK)


# REJECT JOIN REQUEST - POST /api/circles/request/<request_id>/reject/

@extend_schema(
    operation_id="join_request_reject",
    description="Reject a pending join request (circle creator only)",
    responses={200: JoinRequestDetailSerializer},
    tags=["Join Requests"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_join_request(request, request_id):
    """
    Reject a pending join request.
    
    SECURITY: Only the circle creator can reject requests.
    
    Action:
    - Updates request status to 'rejected'
    - User is NOT added to circle
    - User remains outside circle
    
    Returns:
    - 200: Request rejected successfully
    - 400: Request already processed
    - 403: Only creator can reject
    - 404: Request not found
    """
    join_request = get_join_request_or_404(request_id)
    
    if not join_request:
        return Response(
            {'error': 'Join request not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # SECURITY: Only creator can reject
    if join_request.circle.created_by != request.user:
        return Response(
            {'error': 'Only the circle creator can reject requests'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if request is still pending
    if join_request.status != 'pending':
        return Response(
            {'error': f'Request is already {join_request.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Reject request
    success, message = join_request.reject()
    
    if not success:
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    detail_serializer = JoinRequestDetailSerializer(join_request)
    
    return Response({
        'message': 'Join request rejected',
        'request': detail_serializer.data
    }, status=status.HTTP_200_OK)


# ============================================================================
# SOFT DELETE CIRCLE - POST /api/circles/<circle_id>/delete/
# ============================================================================

@extend_schema(
    operation_id="delete_circle",
    description="Soft delete/archive a circle (creator only)",
    tags=["Circles"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_circle(request, circle_id):
    """Soft delete/archive a circle. Only the creator can do this."""
    try:
        circle = Circle.objects.filter(is_active=True, is_deleted=False).get(id=circle_id)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if not circle.is_creator(request.user):
        return Response({'error': 'Only the circle creator can delete this circle'}, status=status.HTTP_403_FORBIDDEN)
    
    circle.soft_delete()
    return Response({'message': 'Circle deleted successfully'}, status=status.HTTP_200_OK)


# ============================================================================
# LEAVE CIRCLE (UPDATED) - POST /api/circles/leave/<id>/
# ============================================================================

@extend_schema(
    operation_id="circles_leave",
    description="Leave a circle (with ownership transfer if creator)",
    responses={200},
    tags=["Circles"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_circle(request, circle_id):
    """
    Leave a circle. If the user is the creator, transfer ownership first.
    """
    try:
        circle = Circle.objects.filter(is_active=True, is_deleted=False).get(id=circle_id)
    except Circle.DoesNotExist:
        return Response(
            {'error': 'Circle not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    user = request.user
    
    # If user is the creator, transfer ownership
    if circle.is_creator(user):
        # First try to transfer to oldest mentor
        oldest_mentor = circle.mentors.order_by('id').first()
        if oldest_mentor:
            circle.transfer_ownership(oldest_mentor)
            return Response({
                'message': 'Circle ownership transferred successfully',
                'new_owner': UserBasicSerializer(oldest_mentor).data
            }, status=status.HTTP_200_OK)
        
        # If no mentors, transfer to oldest member
        oldest_member = circle.members.exclude(id=user.id).order_by('id').first()
        if oldest_member:
            circle.transfer_ownership(oldest_member)
            return Response({
                'message': 'Circle ownership transferred successfully',
                'new_owner': UserBasicSerializer(oldest_member).data
            }, status=status.HTTP_200_OK)
        
        # If no one left, soft delete the circle
        circle.soft_delete()
        return Response({'message': 'Circle deleted (no other members)'}, status=status.HTTP_200_OK)
    
    # If not creator, just leave
    circle.members.remove(user)
    circle.mentors.remove(user)
    
    return Response({
        'message': 'You have left the circle',
        'circle_name': circle.name
    }, status=status.HTTP_200_OK)


# GET PENDING REQUESTS - GET /api/circles/<circle_id>/pending-requests/

@extend_schema(
    operation_id="join_request_list",
    description="List pending join requests for a circle (creator only)",
    responses={200: JoinRequestListSerializer(many=True)},
    tags=["Join Requests"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def circle_pending_requests(request, circle_id):
    """
    List all pending join requests for a circle.
    
    SECURITY: Only the circle creator can see pending requests.
    
    Returns:
    - 200: List of pending requests
    - 403: Only creator can view requests
    - 404: Circle not found
    """
    circle = get_circle_or_404(circle_id)
    
    if not circle:
        return Response(
            {'error': 'Circle not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # SECURITY: Only creator can see requests
    if circle.created_by != request.user:
        return Response(
            {'error': 'Only the circle creator can view join requests'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    join_requests = JoinRequest.objects.filter(
        circle=circle,
        status='pending'
    ).select_related('user__profile')
    
    serializer = JoinRequestListSerializer(
        join_requests,
        many=True
    )
    
    return Response({
        'circle_name': circle.name,
        'pending_count': join_requests.count(),
        'requests': serializer.data
    }, status=status.HTTP_200_OK)


# ============================================================================
# Mentor Management Endpoints
# ============================================================================

@extend_schema(
    operation_id="add_mentor",
    description="Add a mentor to a circle (creator only)",
    tags=["Circles"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_mentor(request, circle_id, mentor_id):
    """Add a mentor to the circle (creator only)."""
    circle = get_circle_or_404(circle_id)
    if not circle:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if not circle.is_creator(request.user):
        return Response({'error': 'Only the circle creator can add mentors'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        mentor_user = User.objects.get(id=mentor_id)
    except User.DoesNotExist:
        return Response({'error': 'Mentor user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if the user is a mentor (has mentor role)
    if not hasattr(mentor_user, 'profile') or mentor_user.profile.role != 'mentor':
        return Response({'error': 'User is not a mentor'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is already a mentor in the circle
    if circle.is_mentor(mentor_user):
        return Response({'error': 'User is already a mentor in this circle'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Add to mentors (and make sure they are in members too)
    circle.mentors.add(mentor_user)
    if not circle.is_member(mentor_user):
        circle.members.add(mentor_user)
    
    # Return updated circle details
    detail_serializer = CircleDetailSerializer(circle, context={'request': request})
    return Response({
        'message': 'Mentor added successfully',
        'circle': detail_serializer.data
    }, status=status.HTTP_200_OK)


@extend_schema(
    operation_id="remove_mentor",
    description="Remove a mentor from a circle (creator only)",
    tags=["Circles"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_mentor(request, circle_id, mentor_id):
    """Remove a mentor from the circle (creator only)."""
    circle = get_circle_or_404(circle_id)
    if not circle:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if not circle.is_creator(request.user):
        return Response({'error': 'Only the circle creator can remove mentors'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        mentor_user = User.objects.get(id=mentor_id)
    except User.DoesNotExist:
        return Response({'error': 'Mentor user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is a mentor in the circle
    if not circle.is_mentor(mentor_user):
        return Response({'error': 'User is not a mentor in this circle'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Remove from mentors (keep in members)
    circle.mentors.remove(mentor_user)
    
    # Return updated circle details
    detail_serializer = CircleDetailSerializer(circle, context={'request': request})
    return Response({
        'message': 'Mentor removed successfully',
        'circle': detail_serializer.data
    }, status=status.HTTP_200_OK)


# ============================================================================
# Discussion List View
# ============================================================================
@extend_schema(
    operation_id="get_discussions",
    description="Get list of discussion messages in a circle",
    tags=["Circles"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_discussions(request, circle_id):
    """Get list of discussion messages in a circle.
    Can filter by category (optional query param)
    """
    try:
        circle = Circle.objects.filter(is_active=True, is_deleted=False).prefetch_related('discussions').get(id=circle_id)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is part of the circle (member/mentor/creator)
    if not (circle.is_member(request.user) or circle.is_mentor(request.user) or circle.is_creator(request.user)):
        return Response({'error': 'You are not part of this circle'}, status=status.HTTP_403_FORBIDDEN)
    
    # Filter by category (optional)
    category = request.query_params.get('category', '')
    discussions = circle.discussions.filter(is_active=True, is_deleted=False).select_related('user', 'user__profile')
    
    if category:
        discussions = discussions.filter(category=category)
    
    # Order by created_at ascending (latest last)
    discussions = discussions.order_by('created_at')
    
    serializer = DiscussionSerializer(discussions, many=True)
    
    return Response({
        'circle_id': circle.id,
        'category': category or 'all',
        'discussions': serializer.data
    }, status=status.HTTP_200_OK)


# ============================================================================
# Create Discussion View
# ============================================================================
@extend_schema(
    operation_id="create_discussion",
    description="Create a new discussion message in a circle",
    tags=["Circles"],
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_discussion(request, circle_id):
    """Create a new discussion message in a circle."""
    try:
        circle = Circle.objects.filter(is_active=True, is_deleted=False).get(id=circle_id)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is part of the circle (member/mentor/creator)
    if not (circle.is_member(request.user) or circle.is_mentor(request.user) or circle.is_creator(request.user)):
        return Response({'error': 'You are not part of this circle'}, status=status.HTTP_403_FORBIDDEN)
    
    # Create serializer
    serializer = CreateDiscussionSerializer(data=request.data)
    
    if serializer.is_valid():
        # Create discussion
        category = serializer.validated_data.get('category') or 'general'
        discussion = Discussion.objects.create(
            circle=circle,
            user=request.user,
            content=serializer.validated_data['content'],
            category=category
        )
        
        # Return serialized discussion
        return_serializer = DiscussionSerializer(discussion)
        return Response({
            'message': 'Message sent successfully',
            'discussion': return_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# ============================================================================
# RESOURCE MANAGEMENT VIEWS
# ============================================================================

@extend_schema(
    operation_id="list_resources",
    description="List all resources in a circle",
    tags=["Circles", "Resources"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_resources(request, circle_id):
    """
    List all resources in a circle.
    
    Query parameters:
    - resource_type: Filter by type (pdf, doc, ppt, link, youtube, notes)
    - search: Search by title or description
    - page: Pagination page number
    
    Only circle members can view resources.
    """
    try:
        circle = Circle.objects.get(id=circle_id, is_active=True, is_deleted=False)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is part of the circle
    if not (circle.is_member(request.user) or circle.is_mentor(request.user) or circle.is_creator(request.user)):
        return Response({'error': 'You are not part of this circle'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get all non-deleted resources
    resources = circle.resources.filter(is_deleted=False).select_related('uploaded_by', 'uploaded_by__profile').order_by('-created_at')
    
    # Filter by type
    resource_type = request.query_params.get('resource_type')
    if resource_type:
        resources = resources.filter(resource_type=resource_type)
    
    # Search by title or description
    search = request.query_params.get('search')
    if search:
        resources = resources.filter(
            Q(title__icontains=search) | Q(description__icontains=search)
        )
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_resources = paginator.paginate_queryset(resources, request)
    
    serializer = ResourceSerializer(paginated_resources, many=True, context={'request': request})
    
    # Return paginated response with results directly
    return paginator.get_paginated_response(serializer.data)


@extend_schema(
    operation_id="create_resource",
    description="Upload a new resource to a circle",
    tags=["Circles", "Resources"],
    request=ResourceCreateSerializer,
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_resource(request, circle_id):
    """
    Create a new resource in a circle.
    
    Only circle owners and mentors can upload resources.
    
    Request body (multipart/form-data):
    {
        "title": "Python Basics",
        "description": "Introduction to Python programming",
        "resource_type": "pdf",
        "file": <file>,
        "external_url": ""
    }
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        circle = Circle.objects.get(id=circle_id, is_active=True, is_deleted=False)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permissions - only creators and mentors can upload
    if not (circle.is_creator(request.user) or circle.is_mentor(request.user)):
        return Response(
            {'error': 'Only circle owners and mentors can upload resources'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Log incoming data for debugging
    logger.info(f"Resource creation attempt by user {request.user.id} for circle {circle_id}")
    logger.info(f"Request data: {request.data}")
    logger.info(f"Request FILES: {request.FILES}")
    
    # Parse and validate
    serializer = ResourceCreateSerializer(
        data=request.data,
        context={'request': request, 'circle': circle}
    )
    
    if serializer.is_valid():
        resource = serializer.save()
        return_serializer = ResourceSerializer(resource, context={'request': request})
        return Response({
            'message': 'Resource uploaded successfully',
            'resource': return_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    # Log validation errors
    logger.error(f"Resource creation validation failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    operation_id="update_resource",
    description="Update a resource",
    tags=["Circles", "Resources"],
    request=ResourceUpdateSerializer,
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_resource(request, resource_id):
    """
    Update a resource (title, description, external_url).
    
    Only the uploader, circle owner, and mentors can edit.
    """
    try:
        resource = Resource.objects.select_related('circle', 'uploaded_by').get(id=resource_id)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if resource is deleted
    if resource.is_deleted:
        return Response({'error': 'Resource has been deleted'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permissions
    if not resource.can_user_edit(request.user):
        return Response(
            {'error': 'You do not have permission to edit this resource'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Update
    serializer = ResourceUpdateSerializer(resource, data=request.data, partial=True)
    
    if serializer.is_valid():
        resource = serializer.save()
        return_serializer = ResourceSerializer(resource, context={'request': request})
        return Response({
            'message': 'Resource updated successfully',
            'resource': return_serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    operation_id="delete_resource",
    description="Soft delete a resource",
    tags=["Circles", "Resources"],
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resource(request, resource_id):
    """
    Soft delete a resource.
    
    Resource remains in database but is hidden from users.
    Only the uploader, circle owner, and mentors can delete.
    """
    try:
        resource = Resource.objects.select_related('circle', 'uploaded_by').get(id=resource_id)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if resource is already deleted
    if resource.is_deleted:
        return Response({'error': 'Resource is already deleted'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permissions
    if not resource.can_user_delete(request.user):
        return Response(
            {'error': 'You do not have permission to delete this resource'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Soft delete
    resource.soft_delete()
    
    return Response({
        'message': 'Resource deleted successfully'
    }, status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    operation_id="get_resource",
    description="Get a specific resource",
    tags=["Circles", "Resources"],
    responses={200: ResourceSerializer},
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resource(request, resource_id):
    """
    Get a specific resource details.
    
    Only circle members can access.
    """
    try:
        resource = Resource.objects.select_related('circle', 'uploaded_by', 'uploaded_by__profile').get(id=resource_id)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if resource is deleted
    if resource.is_deleted:
        return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is part of the circle
    circle = resource.circle
    if not (circle.is_member(request.user) or circle.is_mentor(request.user) or circle.is_creator(request.user)):
        return Response(
            {'error': 'You are not part of this circle'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = ResourceSerializer(resource, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
