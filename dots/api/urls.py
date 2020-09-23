from rest_framework import routers

from .api import MatchViewSet


router = routers.DefaultRouter()

router.register('api/match', MatchViewSet, 'match')

urlpatterns = router.urls