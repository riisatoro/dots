from django.db import models
from django.contrib.auth.models import User


class Match(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	winner = models.CharField(max_length=50)
	looser = models.CharField(max_length=50)
	win_score = models.DecimalField(max_digits=6, decimal_places=1)
	loose_score = models.DecimalField(max_digits=6, decimal_places=1)
