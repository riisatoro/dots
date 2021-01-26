from django.urls import re_path
from .consumers import GameRoomConsumer, ListGamesConsumer

websocket_urlpatterns = [
    re_path(r'ws/room/(?P<room_id>\w+)/$', GameRoomConsumer.as_asgi()),
    re_path(r'ws/rooms/update/$', ListGamesConsumer.as_asgi()),
]
