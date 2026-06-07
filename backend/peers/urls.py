from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeerViewSet, CollaborationRequestViewSet

router = DefaultRouter()
router.register(r"peers", PeerViewSet, basename="peer")
router.register(r"collaboration-requests", CollaborationRequestViewSet, basename="collaboration-request")

urlpatterns = [
    path("", include(router.urls)),
]
