from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIEngineViewSet

# Create router for viewset
router = DefaultRouter()
router.register(r'roadmap', AIEngineViewSet, basename='roadmap')

urlpatterns = [
    path('', include(router.urls)),
]
