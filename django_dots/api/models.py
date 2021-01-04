""" Database models """

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator


class GameRoom(models.Model):
    """Game room where field data saved"""
    field = models.JSONField()
    size = models.IntegerField(validators=[MinValueValidator(6), MaxValueValidator(15)])
    is_started = models.BooleanField(default=False)
    is_ended = models.BooleanField(default=False)
    players = models.ManyToManyField(User, through="UserGame")

    def __str__(self):
        return f"#{self.id} | start is {self.is_started}; end is {self.is_ended}"


class UserGame(models.Model):
    user = models.ForeignKey(User, verbose_name="User", on_delete=models.CASCADE)
    game_room = models.ForeignKey(GameRoom, verbose_name="Game room", on_delete=models.CASCADE)
    color = models.CharField(max_length=255, null=False, blank=False)
    score = models.IntegerField(default=0)
    turn = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.game_room}"
