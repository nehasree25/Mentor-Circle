from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('auth/signup/', views.signup, name='signup'),
    path('auth/login/', views.login, name='login'),
    path('auth/profile/', views.profile, name='profile'),
    path('auth/userprofile/', views.userprofile, name='userprofile'),
    path('auth/refresh/', views.refresh_token, name='refresh_token'),
    path('auth/logout/', views.logout, name='logout'),
    
    # User discovery
    path('auth/users/', views.user_list, name='user_list'),
    
    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    # Profile Stats
    path('profile/stats/', views.profile_stats, name='profile_stats'),
]
