import django.dispatch
from django.db.models import signals

new_game = django.dispatch.Signal()

class NewGameSender():
    def send_signal(self):
        print("send to the cliend")
        new_game.send(sender=self.__class__, data=None)