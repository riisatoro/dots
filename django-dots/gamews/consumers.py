import json
from . import types
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import GameRoom, UserGame
from api.game.main import process


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = "game_room_" + self.room_id
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code=404):
        response = {
            "close_code": close_code,
            "TYPE": types.PLAYER_GIVE_UP,
        }
        await self.close_current_game(self.room_id)
        await self.channel_layer.group_send(
            'game_room_' + self.room_id,
            {
                "type": "reply",
                "data": response
            }
        )
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.user_id = self.scope['user'].id
        self.response = {"TYPE": "UNKNOWN", "error": True, "message": "This action is not allowed!"}

        try:
            data = json.loads(text_data)
        except ValueError:
            data = {"TYPE": "UNKNOWN"}

        if data["TYPE"] == types.PLAYER_CREATE_ROOM:
            pass

        elif data["TYPE"] == types.PLAYER_JOIN_ROOM:
            pass

        elif data["TYPE"] == types.PLAYER_SET_DOT:
            if await self.is_allowed_to_set_point(self.user_id, self.room_id):
                self.field = await self.get_game_field(self.room_id, self.user_id)
                self.user_color = await self.get_this_user_color(self.user_id, self.room_id)
                self.colors = await self.get_user_colors(self.room_id)
                if self.field:
                    game_data = process(self.field, data["fieldPoint"], self.user_color, self.colors)
                    await self.update_field(game_data["field"], self.room_id)
                    await self.change_player_turn(self.room_id)
                    self.response = {"TYPE": types.PLAYER_SET_DOT, "error": False, "data": game_data}

        elif data["TYPE"] == types.PLAYER_GIVE_UP:
            pass

        elif data["TYPE"] == types.GAME_OVER:
            pass

        else:
            self.response = {"TYPE": "UNKNOWN", "error": True, "message": "This action is not allowed!"}

        await self.channel_layer.group_send(
            'game_room_' + self.room_id,
            {
                "type": "reply",
                "data": self.response
            }
        )

    async def reply(self, event):
        await self.send(text_data=json.dumps(
            event["data"]
        ))

    @database_sync_to_async
    def get_game_field(self, room_id, user_id):
        game = UserGame.objects.filter(user=user_id, game_room=room_id)
        if game.exists():
            return game.get().game_room.field
        return False

    @database_sync_to_async
    def get_this_user_color(self, user_id, room_id):
        color = UserGame.objects.filter(user=user_id, game_room=room_id).get().color
        return color

    @database_sync_to_async
    def get_user_colors(self, room_id):
        colors = UserGame.objects.filter(game_room__id=room_id).values_list('color').all()
        colors = [colors[0][0], colors[1][0]]
        return colors

    @database_sync_to_async
    def update_field(self, field, room_id):
        db_field = GameRoom.objects.get(id=room_id)
        db_field.field = field
        db_field.save()

    @database_sync_to_async
    def change_player_turn(self, room_id):
        user1, user2 = UserGame.objects.filter(game_room=room_id).all()
        user1.turn = not user1.turn
        user2.turn = not user2.turn
        user1.save()
        user2.save()

    @database_sync_to_async
    def close_current_game(self, room_id):
        room = GameRoom.objects.get(id=room_id)
        room.is_started = True
        room.is_ended = True
        room.save()

    @database_sync_to_async
    def is_allowed_to_set_point(self, user_id, room_id):
        data = UserGame.objects.filter(user=user_id, game_room=room_id).values_list('game_room__is_started', 'turn').get()
        return data[0] and data[1]
