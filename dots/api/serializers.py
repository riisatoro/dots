from rest_framework import serializers

from . import models


class MatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Match
		fields = '__all__'