from rest_framework import viewsets
from rest_framework import permissions 

from . import serializers
from . import models


class MatchViewSet(viewsets.ModelViewSet):
	permission_classes = [
		permissions.AllowAny
	]
	serializer_class = serializers.MatchSerializer

	def get_queryset(self):
		user = self.request.user
		return models.Match.objects.filter(user=user)
