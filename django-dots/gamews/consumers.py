import json
from . import types
from channels.generic.websocket import AsyncWebsocketConsumer


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = "game_room_1"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "reply",
                "data": {
                    "error": False,
                    "message": "Welcome to WS"
                }
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except:
            data = {"TYPE": "UNKNOWN"}

        if data["TYPE"] == types.PLAYER_CREATE_ROOM:
            pass
        elif data["TYPE"] == types.PLAYER_JOIN_ROOM:
            pass
        elif data["TYPE"] == types.PLAYER_SET_DOT:
            pass
        elif data["TYPE"] == types.PLAYER_GIVE_UP:
            pass
        elif data["TYPE"] == types.GAME_OVER:
            pass
        else:
            response = {"TYPE": "UNKNOWN", "error": True, "message": "This action is not allowed!"}

        await self.channel_layer.group_send(
            'game_room_1',
            {
                "type": "reply",
                "data": response
            }
        )

    async def reply(self, event):
        await self.send(text_data=json.dumps(
            event["data"]
        ))
