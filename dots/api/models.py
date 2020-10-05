from django.db import models
from django.contrib.auth.models import User


class Match(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    winner = models.CharField(max_length=50)
    looser = models.CharField(max_length=50)
    win_score = models.DecimalField(max_digits=6, decimal_places=1)
    loose_score = models.DecimalField(max_digits=6, decimal_places=1)

    def create(self, validated_data):
        return models.Match.objects.create(**validated_data)

    def __str__(self):
    	return "WIN: {0} with {1} points LOOSE: {2} with {3} points".format(self.winner, self.win_score, self.looser, self.loose_score)