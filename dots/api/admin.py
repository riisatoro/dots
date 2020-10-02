from django.contrib import admin
from . import models

@admin.register(models.Match)
class MatchAdmin(admin.ModelAdmin):
	list_display = ('id', 'winner', 'looser', 'win_score', 'loose_score')
