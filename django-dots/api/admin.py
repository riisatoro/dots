""" Settings for django-admin models """

from django.contrib import admin
from . import models

@admin.register(models.Match)
class MatchAdmin(admin.ModelAdmin):
    """ Model settings for django-admin """
    list_display = ('id', 'winner', 'looser', 'win_score', 'loose_score')
