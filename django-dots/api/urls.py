from django.urls import path
from .views import Main, Login, Logout, Register, MatchViewSet


urlpatterns = [
	path('', Main.as_view(), name='main'),
	path('api/auth/login/', Login.as_view(), name='logout'),
	path('api/auth/logout/', Logout.as_view(), name='login'),
	path('api/auth/register/', Register.as_view(), name="register"),
	path('api/match/', MatchViewSet.as_view(), name="match"),
]