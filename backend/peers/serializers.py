from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CollaborationRequest
from circles.models import Circle
from circles.serializers import CircleSimpleSerializer
from django.db.models import Q


class PeerSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    common_circles_count = serializers.SerializerMethodField()
    common_circles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "profile",
            "common_circles_count",
            "common_circles",
        )

    def get_profile(self, obj):
        try:
            profile = obj.profile
            request = self.context.get("request")
            current_user = request.user if request and request.user.is_authenticated else None
            
            # Get common interests
            common_interests = []
            if current_user and hasattr(current_user, 'profile'):
                user_interests = set([i.strip().lower() for i in current_user.profile.interests.split(",") if i.strip()])
                peer_interests = set([i.strip() for i in profile.interests.split(",") if i.strip()])
                # Find matching interests (case-insensitive)
                common_interests = [interest for interest in peer_interests 
                                  if interest.lower() in user_interests]
            
            return {
                "bio": profile.bio,
                "domain": profile.domain,
                "skills": [s.strip() for s in profile.skills.split(",") if s.strip()],
                "interests": [i.strip() for i in profile.interests.split(",") if i.strip()],
                "common_interests": common_interests,
                "experience_level": profile.experience_level,
                "role": profile.role,
                "github": profile.github,
                "linkedin": profile.linkedin,
                "availability": profile.availability,
            }
        except Exception:
            return None

    def get_common_circles_count(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        current_user = request.user
        return Circle.objects.filter(
            Q(members=current_user) | Q(created_by=current_user)
        ).filter(
            Q(members=obj) | Q(created_by=obj)
        ).filter(
            is_active=True, is_deleted=False
        ).distinct().count()

    def get_common_circles(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return []
        current_user = request.user
        circles = Circle.objects.filter(
            Q(members=current_user) | Q(created_by=current_user)
        ).filter(
            Q(members=obj) | Q(created_by=obj)
        ).filter(
            is_active=True, is_deleted=False
        ).distinct()
        return [{"id": circle.id, "name": circle.name} for circle in circles]


class PeerDetailSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    common_circles = serializers.SerializerMethodField()
    collaboration_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "date_joined",
            "profile",
            "common_circles",
            "collaboration_status",
        )

    def get_profile(self, obj):
        try:
            profile = obj.profile
            request = self.context.get("request")
            current_user = request.user if request and request.user.is_authenticated else None
            
            # Get common interests
            common_interests = []
            if current_user and hasattr(current_user, 'profile'):
                user_interests = set([i.strip().lower() for i in current_user.profile.interests.split(",") if i.strip()])
                peer_interests = set([i.strip() for i in profile.interests.split(",") if i.strip()])
                # Find matching interests (case-insensitive)
                common_interests = [interest for interest in peer_interests 
                                  if interest.lower() in user_interests]
            
            return {
                "bio": profile.bio,
                "domain": profile.domain,
                "skills": [s.strip() for s in profile.skills.split(",") if s.strip()],
                "interests": [i.strip() for i in profile.interests.split(",") if i.strip()],
                "common_interests": common_interests,
                "experience_level": profile.experience_level,
                "role": profile.role,
                "learning_goals": profile.learning_goals,
                "years_of_experience": profile.years_of_experience,
                "github": profile.github,
                "linkedin": profile.linkedin,
                "availability": profile.availability,
            }
        except Exception:
            return None

    def get_common_circles(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return []
        current_user = request.user
        circles = Circle.objects.filter(
            Q(members=current_user) | Q(created_by=current_user)
        ).filter(
            Q(members=obj) | Q(created_by=obj)
        ).filter(
            is_active=True, is_deleted=False
        ).distinct()
        return [{"id": circle.id, "name": circle.name} for circle in circles]

    def get_collaboration_status(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.id == obj.id:
            return "none"

        try:
            req = CollaborationRequest.objects.filter(
                sender=request.user, receiver=obj, status="pending"
            ).first()
            if req:
                return "request_sent"

            req = CollaborationRequest.objects.filter(
                sender=obj, receiver=request.user, status="pending"
            ).first()
            if req:
                return "request_received"

            req = CollaborationRequest.objects.filter(
                (Q(sender=request.user) & Q(receiver=obj))
                | (Q(sender=obj) & Q(receiver=request.user)),
                status="accepted",
            ).first()
            if req:
                return "collaborators"
        except Exception:
            pass
        return "none"


class CollaborationRequestSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    receiver_username = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = CollaborationRequest
        fields = (
            "id",
            "sender",
            "sender_username",
            "receiver",
            "receiver_username",
            "message",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "sender", "receiver", "created_at", "updated_at")
