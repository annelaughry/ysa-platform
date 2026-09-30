from django.urls import path
from . import views

app_name = 'research'

urlpatterns = [
    path('', views.hub, name='hub'),
    path('code-green/', views.code_green, name='code_green'),
    path('hydroterra/', views.hydroterra, name='hydroterra'),
]
