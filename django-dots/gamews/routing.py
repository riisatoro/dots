from django.urls import re_path
from .consumers import GameRoomConsumer

websocket_urlpatterns = [
    re_path(r'ws/global/$', GameRoomConsumer.as_asgi()),
]
