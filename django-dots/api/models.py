""" Database models """

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator


class Match(models.Model):
    """Keeps result of matches between two players. Also handles equal score."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    winner = models.CharField(max_length=50)
    looser = models.CharField(max_length=50)
    win_score = models.IntegerField()
    loose_score = models.IntegerField()
    equal = models.BooleanField(default=False)

    def create(self, validated_data):
        """Save match results"""
        return Match.objects.create(**validated_data)

    def __str__(self):
        if self.equal:
            return f"No winners! {self.winner} vs"\
                "{self.looser}with equal score of {self.win_score}"

        return f"WIN: {self.winner} with {self.win_score}"\
            "points LOOSE: {self.looser} with {self.loose_score} points"


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

    class Meta:
        unique_together = ('user', 'game_room',)

    def __str__(self):
        return f"{self.game_room}"
    
