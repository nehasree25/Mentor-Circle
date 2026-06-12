from django.urls import path
from . import views

app_name = 'circles'

urlpatterns = [
    # ============================================================================
    # Circle Management Endpoints
    # ============================================================================
    
    # Create a new circle
    path('create/', views.create_circle, name='create'),
    
    # List all circles (paginated)
    path('', views.circle_list, name='list'),
    
    # Get detailed information about a circle
    path('<int:circle_id>/', views.circle_detail, name='detail'),
    
    # ============================================================================
    # Circle Membership Endpoints
    # ============================================================================
    
    # Join a circle (instant for public, request for private)
    path('join/<int:circle_id>/', views.join_circle, name='join'),
    
    # Leave a circle (creator cannot leave)
    path('leave/<int:circle_id>/', views.leave_circle, name='leave'),
    
    # ============================================================================
    # Mentor Management Endpoints (creator only)
    # ============================================================================
    
    # Add a mentor to the circle
    path('<int:circle_id>/mentors/add/<int:mentor_id>/', views.add_mentor, name='add_mentor'),
    
    # Remove a mentor from the circle
    path('<int:circle_id>/mentors/remove/<int:mentor_id>/', views.remove_mentor, name='remove_mentor'),
    
    # ============================================================================
    # Delete Circle Endpoint (creator only)
    # ============================================================================
    
    # Soft delete a circle
    path('<int:circle_id>/delete/', views.delete_circle, name='delete_circle'),
    
    # ============================================================================
    # Join Request Endpoints (for private circles)
    # ============================================================================
    
    # Create a join request for a private circle
    path('request/<int:circle_id>/', views.request_join_circle, name='request_join'),
    
    # Approve a pending join request (creator only)
    path('request/<int:request_id>/approve/', views.approve_join_request, name='approve_request'),
    
    # Reject a pending join request (creator only)
    path('request/<int:request_id>/reject/', views.reject_join_request, name='reject_request'),
    
    # Get pending join requests for a circle (creator only)
    path('<int:circle_id>/pending-requests/', views.circle_pending_requests, name='pending_requests'),
    
    # ============================================================================
    # Discussion Endpoints
    # ============================================================================
    
    # Get list of discussions in circle
    path('<int:circle_id>/discussions/', views.get_discussions, name='get_discussions'),
    
    # Create a new discussion message
    path('<int:circle_id>/discussions/create/', views.create_discussion, name='create_discussion'),
    
    # ============================================================================
    # Resource Endpoints
    # ============================================================================
    
    # List resources in a circle
    path('<int:circle_id>/resources/', views.list_resources, name='list_resources'),
    
    # Create a new resource (owner/mentor only)
    path('<int:circle_id>/resources/create/', views.create_resource, name='create_resource'),
    
    # Get a specific resource
    path('resources/<int:resource_id>/', views.get_resource, name='get_resource'),
    
    # Update a resource (owner/mentor only)
    path('resources/<int:resource_id>/update/', views.update_resource, name='update_resource'),
    
    # Delete a resource (soft delete, owner/mentor only)
    path('resources/<int:resource_id>/delete/', views.delete_resource, name='delete_resource'),
    
    # ============================================================================
    # Circle Discovery Endpoints
    # ============================================================================
    
    # Search and filter circles
    path('search/', views.search_circles, name='search'),
    
    # Get circles where user is member, creator, or mentor
    path('my-circles/', views.my_circles, name='my_circles'),
]
