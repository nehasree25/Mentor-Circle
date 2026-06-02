from django.urls import path
from . import views

app_name = 'mentors'

urlpatterns = [
    # Get list of all mentors
    path('', views.mentor_list, name='list'),
    
    # Get specific mentor details
    path('<int:mentor_id>/', views.mentor_detail, name='detail'),
]
