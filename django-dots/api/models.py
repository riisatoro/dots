from django.db import models
from django.contrib.auth.models import User


class Match(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    winner = models.CharField(max_length=50)
    looser = models.CharField(max_length=50)
    win_score = models.IntegerField()
    loose_score = models.IntegerField()
    equal = models.BooleanField(default=False)

    def create(self, validated_data):
        return models.Match.objects.create(**validated_data)

    def __str__(self):
    	if self.equal:
    		return f"No winners! {self.winner} vs {self.looser} with equal score of {self.win_score}"
    	else:
    		return f"WIN: {self.winner} with {self.win_score} points LOOSE: {self.looser} with {self.loose_score} points"