"""
Custom DRF Permissions for Circles System.

Implements fine-grained access control for circle operations.
"""

from rest_framework.permissions import BasePermission


class IsCircleCreator(BasePermission):
    """
    Permission to allow only the circle creator to perform actions.
    
    Allowed actions:
    - Update circle
    - Delete circle
    - Approve join requests
    - Reject join requests
    - Add/remove mentors
    
    Examples:
    - Only circle creator can update circle info
    - Only circle creator can approve member requests
    - Only circle creator can delete circle
    """
    
    message = "Only the circle creator can perform this action."
    
    def has_permission(self, request, view):
        """Check if user is authenticated."""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Check if user is the circle creator."""
        # obj can be a Circle or JoinRequest
        if hasattr(obj, 'created_by'):
            # It's a Circle object
            return obj.created_by == request.user
        elif hasattr(obj, 'circle'):
            # It's a JoinRequest object
            return obj.circle.created_by == request.user
        return False


class IsCircleMember(BasePermission):
    """
    Permission to allow only circle members to perform actions.
    
    Allowed actions:
    - View circle details (if member)
    - See member list
    
    Note: Members have limited permissions.
    Creators have special permissions (see IsCircleCreator).
    """
    
    message = "You must be a member of this circle to perform this action."
    
    def has_permission(self, request, view):
        """Check if user is authenticated."""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Check if user is a circle member or creator."""
        circle = obj if hasattr(obj, 'members') else obj.circle
        return circle.members.filter(id=request.user.id).exists() or \
               circle.created_by == request.user


class IsMentorUser(BasePermission):
    """
    Permission to allow only users with mentor role.
    
    Checks:
    - User profile role must be 'mentor'
    
    Used for:
    - Adding user as mentor to circle
    - Accessing mentor-specific endpoints
    """
    
    message = "Only users with mentor role can perform this action."
    
    def has_permission(self, request, view):
        """Check if user is a mentor."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has a mentor role in their profile
        try:
            return request.user.profile.role == 'mentor'
        except:
            return False


class CanJoinCircle(BasePermission):
    """
    Permission to check if user can join a circle.
    
    Validation:
    - Not already a member
    - Circle is not full
    - User is not pending
    
    Used for:
    - POST /api/circles/join/<id>/
    """
    
    message = "You cannot join this circle."
    
    def has_permission(self, request, view):
        """Check if user is authenticated."""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Check if user can join circle."""
        # obj is a Circle
        can_join, _ = obj.can_add_member(request.user)
        return can_join


class CanLeaveCircle(BasePermission):
    """
    Permission to check if user can leave a circle.
    
    Validation:
    - User is a member
    - User is not the creator
    
    Used for:
    - POST /api/circles/leave/<id>/
    """
    
    message = "You cannot leave this circle."
    
    def has_permission(self, request, view):
        """Check if user is authenticated."""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Check if user can leave circle."""
        # obj is a Circle
        is_member = obj.members.filter(id=request.user.id).exists()
        is_creator = obj.created_by_id == request.user.id
        
        # Can't leave if creator, can't leave if not member
        return is_member and not is_creator


class CanManageJoinRequest(BasePermission):
    """
    Permission to approve/reject join requests.
    
    Only circle creator can:
    - Approve requests
    - Reject requests
    
    Used for:
    - POST /api/circles/request/<request_id>/approve/
    - POST /api/circles/request/<request_id>/reject/
    """
    
    message = "Only the circle creator can manage join requests."
    
    def has_permission(self, request, view):
        """Check if user is authenticated."""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Check if user is the circle creator."""
        # obj is a JoinRequest
        return obj.circle.created_by == request.user
