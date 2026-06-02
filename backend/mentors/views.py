from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_spectacular.utils import extend_schema

from django.contrib.auth.models import User
from users.models import UserProfile
from users.serializers import UserDetailSerializer


# ============================================================================
# Mentors List View - Get all mentors
# ============================================================================

@extend_schema(
    operation_id="mentors_list",
    description="Get list of all available mentors with filters",
    responses={200: UserDetailSerializer(many=True)},
    tags=["Mentors"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mentor_list(request):
    """
    Get list of all available mentors with filtering and pagination.
    
    Query Parameters:
    - search: Search by username, first name, last name, or email
    - expertise: Filter by mentorship expertise
    - page: Page number
    - limit: Results per page
    """
    # Get all users who are mentors
    mentors_qs = User.objects.filter(
        profile__is_mentor=True,
        profile__role='mentor'
    ).prefetch_related('profile').distinct()
    
    # Search filter
    search_query = request.query_params.get('search', '')
    if search_query:
        mentors_qs = mentors_qs.filter(
            Q(username__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )
    
    # Expertise filter
    expertise = request.query_params.get('expertise', '')
    if expertise:
        mentors_qs = mentors_qs.filter(
            profile__mentorship_expertise__icontains=expertise
        )
    
    # Pagination
    paginator = PageNumberPagination()
    limit = request.query_params.get('limit', 20)
    try:
        paginator.page_size = int(limit)
    except (ValueError, TypeError):
        paginator.page_size = 20

    paginated_mentors = paginator.paginate_queryset(mentors_qs, request)
    serializer = UserDetailSerializer(paginated_mentors, many=True)
    
    return paginator.get_paginated_response(serializer.data)


# ============================================================================
# Mentor Detail View - Get specific mentor info
# ============================================================================

@extend_schema(
    operation_id="mentors_detail",
    description="Get detailed information about a specific mentor",
    responses={200: UserDetailSerializer},
    tags=["Mentors"],
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mentor_detail(request, mentor_id):
    """
    Get detailed information about a specific mentor.
    """
    mentor = get_object_or_404(
        User.objects.prefetch_related('profile'),
        id=mentor_id
    )
    
    # Verify this is a mentor
    if not hasattr(mentor, 'profile') or not mentor.profile.is_mentor:
        return Response(
            {'error': 'This user is not a mentor'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = UserDetailSerializer(mentor)
    return Response(serializer.data, status=status.HTTP_200_OK)

