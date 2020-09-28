from django.urls import path
from rest_framework import routers

from .api import Login
from .api import Register
from .api import MatchViewSet


router = routers.DefaultRouter()

urlpatterns = [
	path('api/auth/login/', Login.as_view(), name='login'),
	path('api/auth/register/', Register.as_view(), name="register"),
]

router.register('api/match', MatchViewSet, 'match')


urlpatterns += router.urls