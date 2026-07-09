from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from django.db.models import Q, Count
from .models import CollaborationRequest
from .serializers import (
    PeerSerializer,
    PeerDetailSerializer,
    CollaborationRequestSerializer,
)
from circles.models import Circle


class PeerPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = "limit"
    max_page_size = 50


class PeerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().select_related("profile")
    serializer_class = PeerSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PeerPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "first_name", "last_name", "profile__bio", "profile__skills", "profile__interests"]
    ordering_fields = ["username", "date_joined"]

    def get_queryset(self):
        user = self.request.user
        domain = self.request.query_params.get('domain')
        skills_filter = self.request.query_params.get('skills')
        interests_filter = self.request.query_params.get('interests')
        circles_filter = self.request.query_params.get('circles')

        # Get IDs of active, non-deleted circles the current user is part of (joined or created)
        user_circles = Circle.objects.filter(
            Q(members=user) | Q(created_by=user),
            is_active=True,
            is_deleted=False
        )

        if domain:
            user_circles = user_circles.filter(domain=domain)

        # Filter by circle name if provided
        if circles_filter:
            user_circles = user_circles.filter(name__icontains=circles_filter)

        user_circles_ids = user_circles.values_list('id', flat=True)

        # Filter peers who share at least one active, non-deleted circle, exclude mentors
        queryset = (
            User.objects.filter(
                Q(joined_circles__id__in=user_circles_ids) | Q(created_circles__id__in=user_circles_ids)
            )
            .exclude(id=user.id)
            .exclude(profile__role='mentor')
            .select_related("profile")
            .distinct()
        )

        # Apply skills filter
        if skills_filter:
            queryset = queryset.filter(profile__skills__icontains=skills_filter)

        # Apply interests filter
        if interests_filter:
            queryset = queryset.filter(profile__interests__icontains=interests_filter)

        # Sorting: profile updated_at (desc), username (asc)
        return queryset.order_by('-profile__updated_at', 'username')

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PeerDetailSerializer
        return PeerSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=False, methods=["GET"], permission_classes=[IsAuthenticated])
    def stats(self, request):
        """Return aggregate peer stats for the current user — not page-scoped."""
        user = request.user

        # All circles the current user belongs to
        user_circles = Circle.objects.filter(
            Q(members=user) | Q(created_by=user),
            is_active=True,
            is_deleted=False
        )
        user_circles_ids = list(user_circles.values_list('id', flat=True))

        # All peers (same logic as get_queryset, no pagination)
        all_peers = (
            User.objects.filter(
                Q(joined_circles__id__in=user_circles_ids) | Q(created_circles__id__in=user_circles_ids)
            )
            .exclude(id=user.id)
            .exclude(profile__role='mentor')
            .select_related("profile")
            .distinct()
        )

        total_peers = all_peers.count()

        # Shared circles: total distinct circles shared between current user and any peer
        shared_circles_count = Circle.objects.filter(
            Q(members=user) | Q(created_by=user)
        ).filter(
            Q(members__in=all_peers) | Q(created_by__in=all_peers)
        ).filter(
            is_active=True, is_deleted=False
        ).distinct().count()

        # Common interests: sum across all peers
        user_interests = set(
            i.strip().lower()
            for i in (user.profile.interests if hasattr(user, 'profile') else "").split(",")
            if i.strip()
        )
        total_common_interests = 0
        for peer in all_peers:
            try:
                peer_interests = set(
                    i.strip().lower()
                    for i in peer.profile.interests.split(",")
                    if i.strip()
                )
                total_common_interests += len(user_interests & peer_interests)
            except Exception:
                pass

        # New connections: peers with no active collaboration
        collab_qs = CollaborationRequest.objects.filter(
            Q(sender=user) | Q(receiver=user),
            status__in=["pending", "accepted"]
        )
        connected_peer_ids = set()
        for req in collab_qs.values('sender_id', 'receiver_id'):
            other_id = req['receiver_id'] if req['sender_id'] == user.id else req['sender_id']
            connected_peer_ids.add(other_id)
        new_connections = all_peers.exclude(id__in=connected_peer_ids).count()

        return Response({
            "total_peers": total_peers,
            "shared_circles": shared_circles_count,
            "common_interests": total_common_interests,
            "new_connections": new_connections,
        })

    @action(detail=True, methods=["POST"], permission_classes=[IsAuthenticated])
    def send_collaboration_request(self, request, pk=None):
        receiver = self.get_object()
        if request.user == receiver:
            return Response(
                {"error": "Cannot send request to yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for existing pending requests
        existing = CollaborationRequest.objects.filter(
            (Q(sender=request.user) & Q(receiver=receiver))
            | (Q(sender=receiver) & Q(receiver=request.user)),
            status="pending",
        ).first()
        if existing:
            return Response(
                {"error": "A pending request already exists between you two"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        req = CollaborationRequest.objects.create(
            sender=request.user,
            receiver=receiver,
            message=request.data.get("message", ""),
        )
        return Response(
            CollaborationRequestSerializer(req).data,
            status=status.HTTP_201_CREATED,
        )


class CollaborationRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CollaborationRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CollaborationRequest.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).select_related("sender", "receiver")

    @action(detail=True, methods=["POST"], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        req = self.get_object()
        if req.receiver != request.user:
            return Response(
                {"error": "You can only accept requests sent to you"},
                status=status.HTTP_403_FORBIDDEN,
            )
        req.status = "accepted"
        req.save()
        return Response({"status": "accepted"})

    @action(detail=True, methods=["POST"], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        req = self.get_object()
        if req.receiver != request.user:
            return Response(
                {"error": "You can only reject requests sent to you"},
                status=status.HTTP_403_FORBIDDEN,
            )
        req.status = "rejected"
        req.save()
        return Response({"status": "rejected"})

    @action(detail=True, methods=["POST"], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        req = self.get_object()
        if req.sender != request.user:
            return Response(
                {"error": "You can only cancel requests you sent"},
                status=status.HTTP_403_FORBIDDEN,
            )
        req.status = "cancelled"
        req.save()
        return Response({"status": "cancelled"})
