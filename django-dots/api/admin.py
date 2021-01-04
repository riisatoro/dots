""" Settings for django-admin models """

from django.contrib import admin
from . import models


@admin.register(models.GameRoom)
class GameRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'field', 'size', 'is_started', 'is_ended')
    filter_horizontal = ('players', )


@admin.register(models.UserGame)
class UserGameAdmin(admin.ModelAdmin):
    list_display = ('user', 'game_room', 'color', 'score', 'turn')
