from django.urls import re_path
from .consumers import GameRoomConsumer

websocket_urlpatterns = [
    re_path(r'ws/room/(?P<room_id>\w+)/$', GameRoomConsumer.as_asgi()),
]
