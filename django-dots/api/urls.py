from django.urls import path
from .views import Main, Login, Logout, Register, MatchViewSet, GameRoomView


urlpatterns = [
	path('', Main.as_view(), name='main'),
	path('api/auth/login/', Login.as_view(), name='logout'),
	path('api/auth/logout/', Logout.as_view(), name='login'),
	path('api/auth/register/', Register.as_view(), name="register"),
	path('api/match/', MatchViewSet.as_view(), name="match"),

	path('api/v2/rooms/', GameRoomView.as_view(), name="game_room")
]