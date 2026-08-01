"""
Views for Mentorship and Collaboration System.

Implements:
- Guidance request workflow (Student → Mentor)
- Collaboration request workflow (Peer → Peer)
- Private conversations (after acceptance)
- Message management
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User

from .models import GuidanceRequest, CollaborationRequest, Conversation, Message
from circles.models import Circle
from .serializers import (
    GuidanceRequestSerializer, GuidanceRequestCreateSerializer,
    CollaborationRequestSerializer, CollaborationRequestCreateSerializer,
    ConversationSerializer, MessageSerializer, MessageCreateSerializer,
    UserProfileDetailSerializer
)


# ============================================================================
# GUIDANCE REQUEST VIEWS
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_guidance_request(request, circle_id, mentor_id):
    """
    Create a guidance request to a mentor.
    
    Student → Mentor: Request Guidance
    """
    try:
        circle = Circle.objects.get(id=circle_id, is_active=True, is_deleted=False)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        mentor = User.objects.get(id=mentor_id)
    except User.DoesNotExist:
        return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if mentor is a mentor role (from profile)
    if not hasattr(mentor, 'profile') or mentor.profile.role != 'mentor':
        return Response(
            {'error': 'User is not a mentor'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if requester is part of the circle
    if not (circle.is_member(request.user) or circle.is_mentor(request.user) or circle.is_creator(request.user)):
        return Response(
            {'error': 'You must be a member of this circle'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Cannot request guidance from yourself
    if request.user.id == mentor_id:
        return Response(
            {'error': 'You cannot request guidance from yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = GuidanceRequestCreateSerializer(
        data=request.data,
        context={'request': request, 'mentor': mentor, 'circle': circle}
    )
    
    if serializer.is_valid():
        guidance_request = serializer.save()
        return_serializer = GuidanceRequestSerializer(guidance_request)
        return Response({
            'message': 'Guidance request sent successfully',
            'request': return_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_guidance_requests(request):
    """
    Get guidance requests for current user.
    
    - If mentor: Get requests sent TO them (pending/accepted/rejected)
    - If student: Get requests sent BY them
    """
    user_type = request.query_params.get('type', 'received')  # 'received' or 'sent'
    request_status = request.query_params.get('status', 'pending')
    
    if user_type == 'received':
        # Requests sent TO current user (as mentor)
        requests = GuidanceRequest.objects.filter(
            mentor=request.user
        ).select_related('sender', 'mentor', 'circle', 'sender__profile', 'mentor__profile').order_by('-created_at')
    else:
        # Requests sent BY current user
        requests = GuidanceRequest.objects.filter(
            sender=request.user
        ).select_related('sender', 'mentor', 'circle', 'sender__profile', 'mentor__profile').order_by('-created_at')
    
    if request_status and request_status != 'all':
        requests = requests.filter(status=request_status)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_requests = paginator.paginate_queryset(requests, request)
    
    serializer = GuidanceRequestSerializer(paginated_requests, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_guidance_request(request, request_id):
    """
    Accept a guidance request (mentor only).
    Creates a private conversation.
    """
    try:
        guidance_request = GuidanceRequest.objects.select_related('sender', 'mentor', 'circle').get(id=request_id)
    except GuidanceRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only mentor can accept
    if guidance_request.mentor.id != request.user.id:
        return Response(
            {'error': 'Only the mentor can accept this request'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    success, message = guidance_request.accept()
    
    if success:
        serializer = GuidanceRequestSerializer(guidance_request)
        # Safely access conversation — it's created inside accept() atomically
        try:
            conversation_id = guidance_request.conversation.id
        except Exception:
            conversation_id = None
        return Response({
            'message': message,
            'request': serializer.data,
            'conversation_id': conversation_id,
            'circle_id': guidance_request.circle.id,
            'circle_is_private': guidance_request.circle.is_private
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_guidance_request(request, request_id):
    """
    Reject a guidance request (mentor only).
    """
    try:
        guidance_request = GuidanceRequest.objects.get(id=request_id)
    except GuidanceRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only mentor can reject
    if guidance_request.mentor.id != request.user.id:
        return Response(
            {'error': 'Only the mentor can reject this request'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get rejection reason from request data
    rejection_reason = request.data.get('rejection_reason')
    if not rejection_reason:
        return Response(
            {'error': 'Rejection reason is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    success, message = guidance_request.reject(rejection_reason)
    
    if success:
        serializer = GuidanceRequestSerializer(guidance_request)
        return Response({
            'message': message,
            'request': serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# COLLABORATION REQUEST VIEWS
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_collaboration_request(request, circle_id, peer_id):
    """
    Create a collaboration request to a peer.
    
    Peer → Peer: Collaborate Request
    """
    try:
        circle = Circle.objects.get(id=circle_id, is_active=True, is_deleted=False)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        peer = User.objects.get(id=peer_id)
    except User.DoesNotExist:
        return Response({'error': 'Peer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if both users are members of the circle
    if not (circle.is_member(request.user) or circle.is_creator(request.user)):
        return Response(
            {'error': 'You must be a member of this circle'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not (circle.is_member(peer) or circle.is_creator(peer)):
        return Response(
            {'error': 'Peer must be a member of this circle'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Cannot collaborate with yourself
    if request.user.id == peer_id:
        return Response(
            {'error': 'You cannot collaborate with yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = CollaborationRequestCreateSerializer(
        data=request.data,
        context={'request': request, 'receiver': peer, 'circle': circle}
    )
    
    if serializer.is_valid():
        collaboration_request = serializer.save()
        return_serializer = CollaborationRequestSerializer(collaboration_request)
        return Response({
            'message': 'Collaboration request sent successfully',
            'request': return_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_collaboration_requests(request):
    """
    Get collaboration requests for current user.
    
    - type=received: Get requests sent TO current user
    - type=sent: Get requests sent BY current user
    """
    user_type = request.query_params.get('type', 'received')
    request_status = request.query_params.get('status', 'pending')
    
    if user_type == 'received':
        # Requests sent TO current user
        requests = CollaborationRequest.objects.filter(
            receiver=request.user
        ).select_related('sender', 'receiver', 'circle', 'sender__profile', 'receiver__profile').order_by('-created_at')
    else:
        # Requests sent BY current user
        requests = CollaborationRequest.objects.filter(
            sender=request.user
        ).select_related('sender', 'receiver', 'circle', 'sender__profile', 'receiver__profile').order_by('-created_at')
    
    if request_status and request_status != 'all':
        requests = requests.filter(status=request_status)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_requests = paginator.paginate_queryset(requests, request)
    
    serializer = CollaborationRequestSerializer(paginated_requests, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_collaboration_request(request, request_id):
    """
    Accept a collaboration request (receiver only).
    Creates a private conversation.
    """
    try:
        collaboration_request = CollaborationRequest.objects.select_related('sender', 'receiver', 'circle').get(id=request_id)
    except CollaborationRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only receiver can accept
    if collaboration_request.receiver.id != request.user.id:
        return Response(
            {'error': 'Only the receiver can accept this request'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    success, message = collaboration_request.accept()
    
    if success:
        serializer = CollaborationRequestSerializer(collaboration_request)
        try:
            conversation_id = collaboration_request.conversation.id
        except Exception:
            conversation_id = None
        return Response({
            'message': message,
            'request': serializer.data,
            'conversation_id': conversation_id
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_collaboration_request(request, request_id):
    """
    Reject a collaboration request (receiver only).
    """
    try:
        collaboration_request = CollaborationRequest.objects.get(id=request_id)
    except CollaborationRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only receiver can reject
    if collaboration_request.receiver.id != request.user.id:
        return Response(
            {'error': 'Only the receiver can reject this request'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    success, message = collaboration_request.reject()
    
    if success:
        serializer = CollaborationRequestSerializer(collaboration_request)
        return Response({
            'message': message,
            'request': serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# CONVERSATION VIEWS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_conversations(request):
    """
    Get all conversations for current user.
    Only shows conversations from accepted requests.
    """
    conversations = Conversation.objects.filter(
        participants=request.user,
        is_active=True,
        is_deleted=False
    ).prefetch_related('participants', 'participants__profile').select_related('circle').order_by('-last_message_at', '-created_at')
    
    conversation_type = request.query_params.get('type')
    if conversation_type and conversation_type in ['guidance', 'collaboration']:
        conversations = conversations.filter(conversation_type=conversation_type)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_conversations = paginator.paginate_queryset(conversations, request)
    
    serializer = ConversationSerializer(paginated_conversations, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation(request, conversation_id):
    """
    Get a specific conversation.
    Only participants can access.
    """
    try:
        conversation = Conversation.objects.prefetch_related('participants', 'participants__profile').select_related('circle').get(
            id=conversation_id,
            is_active=True,
            is_deleted=False
        )
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is a participant
    if not conversation.is_participant(request.user):
        return Response(
            {'error': 'You are not a participant in this conversation'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================================
# MESSAGE VIEWS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, conversation_id):
    """
    Get messages in a conversation.
    Only participants can access.
    """
    try:
        conversation = Conversation.objects.get(
            id=conversation_id,
            is_active=True,
            is_deleted=False
        )
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is a participant
    if not conversation.is_participant(request.user):
        return Response(
            {'error': 'You are not a participant in this conversation'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get messages
    messages = conversation.messages.filter(is_deleted=False).select_related('sender', 'sender__profile').order_by('created_at')
    
    # Mark messages as read (not sent by current user)
    messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 50
    paginated_messages = paginator.paginate_queryset(messages, request)
    
    serializer = MessageSerializer(paginated_messages, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, conversation_id):
    """
    Send a message in a conversation.
    Only participants can send messages.
    """
    try:
        conversation = Conversation.objects.get(
            id=conversation_id,
            is_active=True,
            is_deleted=False
        )
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is a participant
    if not conversation.is_participant(request.user):
        return Response(
            {'error': 'You are not a participant in this conversation'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = MessageCreateSerializer(
        data=request.data,
        context={'request': request, 'conversation': conversation}
    )
    
    if serializer.is_valid():
        message = serializer.save()
        return_serializer = MessageSerializer(message, context={'request': request})
        return Response({
            'message': 'Message sent successfully',
            'data': return_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# USER PROFILE VIEW
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request, user_id):
    """
    Get public profile information for a user.
    
    Shows ONLY public data:
    - Profile picture
    - Name
    - Role
    - Domain
    - Skills
    - Interests
    - Learning goals
    
    Does NOT show:
    - Email
    - Phone
    - Password
    - Private account details
    """
    try:
        user = User.objects.select_related('profile').get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UserProfileDetailSerializer(user, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
