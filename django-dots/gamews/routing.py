from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from .consumers import GameRoomConsumer

websocket_urlpatterns = [
    re_path(r'ws/room/(?P<room_id>\w+)/$', GameRoomConsumer.as_asgi()),
]