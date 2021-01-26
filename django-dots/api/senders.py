import django.dispatch
from django.db.models import signals

new_game = django.dispatch.Signal()
from .models import UserGame
from .serializers import UserGameSerializer

class NewGameSender():
    def send_signal(self):
        rooms = UserGameSerializer(
            UserGame.objects.filter(game_room__is_started=False), 
            many=True
        ).data
        new_game.send(sender=self.__class__, rooms=rooms)
