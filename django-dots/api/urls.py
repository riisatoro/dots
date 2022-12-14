from django.urls import path
from . import views


urlpatterns = [
    path('api/auth/login/', views.Login.as_view(), name='logout'),
    path('api/auth/logout/', views.Logout.as_view(), name='login'),
    path('api/auth/register/', views.Register.as_view(), name="register"),

    path('api/v2/match/', views.MatchViewSet.as_view(), name="match"),
    path('api/v2/rooms/', views.GameRoomView.as_view(), name="game_room"),
    path('api/v2/join/', views.GameRoomJoin.as_view(), name="join_room"),
    path('api/v2/leave/', views.GameRoomLeave.as_view(), name="leave_room")
]
