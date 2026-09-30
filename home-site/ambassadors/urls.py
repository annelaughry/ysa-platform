from django.urls import path
from . import views

app_name = 'ambassadors'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('teams/', views.teams, name='teams'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('quiz/', views.quiz, name='quiz'),
    path('quiz/result/', views.quiz_result, name='quiz_result'),
]
