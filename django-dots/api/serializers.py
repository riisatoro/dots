from rest_framework import serializers
from django.contrib.auth.models import User

from . import models


class MatchSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model = models.Match
        fields = ('user', 'winner', 'looser', 'win_score', 'loose_score', 'equal')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', )


class GameRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.GameRoom
        fields = ('id', 'size', )


class UserGameSerializer(serializers.ModelSerializer):
    game_room = GameRoomSerializer()
    user = UserSerializer()

    class Meta:
        model = models.UserGame
        fields = ('color', 'turn', 'game_room', 'user')
        depth = 1