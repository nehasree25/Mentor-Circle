from django.urls import path
from . import views

app_name = 'mentorship'

urlpatterns = [
    # ============================================================================
    # Guidance Request Endpoints (Student → Mentor)
    # ============================================================================
    
    # Create guidance request
    path('guidance/request/<int:circle_id>/<int:mentor_id>/', 
         views.create_guidance_request, 
         name='create_guidance_request'),
    
    # Get my guidance requests (received as mentor, sent as student)
    path('guidance/my-requests/', 
         views.my_guidance_requests, 
         name='my_guidance_requests'),
    
    # Accept guidance request (mentor only)
    path('guidance/request/<int:request_id>/accept/', 
         views.accept_guidance_request, 
         name='accept_guidance_request'),
    
    # Reject guidance request (mentor only)
    path('guidance/request/<int:request_id>/reject/', 
         views.reject_guidance_request, 
         name='reject_guidance_request'),
    
    # ============================================================================
    # Collaboration Request Endpoints (Peer → Peer)
    # ============================================================================
    
    # Create collaboration request
    path('collaboration/request/<int:circle_id>/<int:peer_id>/', 
         views.create_collaboration_request, 
         name='create_collaboration_request'),
    
    # Get my collaboration requests (received or sent)
    path('collaboration/my-requests/', 
         views.my_collaboration_requests, 
         name='my_collaboration_requests'),
    
    # Accept collaboration request (receiver only)
    path('collaboration/request/<int:request_id>/accept/', 
         views.accept_collaboration_request, 
         name='accept_collaboration_request'),
    
    # Reject collaboration request (receiver only)
    path('collaboration/request/<int:request_id>/reject/', 
         views.reject_collaboration_request, 
         name='reject_collaboration_request'),
    
    # ============================================================================
    # Conversation Endpoints (Available After Acceptance)
    # ============================================================================
    
    # Get all conversations for current user
    path('conversations/', 
         views.my_conversations, 
         name='my_conversations'),
    
    # Get specific conversation
    path('conversations/<int:conversation_id>/', 
         views.get_conversation, 
         name='get_conversation'),
    
    # ============================================================================
    # Message Endpoints
    # ============================================================================
    
    # Get messages in a conversation
    path('conversations/<int:conversation_id>/messages/', 
         views.get_messages, 
         name='get_messages'),
    
    # Send a message
    path('conversations/<int:conversation_id>/messages/send/', 
         views.send_message, 
         name='send_message'),
    
    # ============================================================================
    # User Profile
    # ============================================================================
    
    # Get public user profile
    path('users/<int:user_id>/profile/', 
         views.get_user_profile, 
         name='get_user_profile'),
]
