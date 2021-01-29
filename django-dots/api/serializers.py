from rest_framework import serializers
from django.contrib.auth.models import User

from . import models


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', )


class GameRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.GameRoom
        fields = ('id', 'size', 'field')


class UserGameSerializer(serializers.ModelSerializer):
    game_room = GameRoomSerializer()
    user = UserSerializer()

    class Meta:
        model = models.UserGame
        fields = ('color', 'turn', 'game_room', 'user', 'score', )
        depth = 1
