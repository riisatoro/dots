import json
from . import types
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from api.models import GameRoom, UserGame
from api.game.core import Core, Field
from api.game.serializers import GameFieldSerializer
from api.game.structure import Point


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = "game_room_" + self.room_id
        if self.scope["user"].is_authenticated:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code=404):
        response = {
            "close_code": close_code,
            "TYPE": types.SOCKET_DISCONNECT,
        }

        await self.close_current_game(self.room_id)

        await self.channel_layer.group_send(
            "game_room_" + self.scope['url_route']['kwargs']['room_id'],
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
        room_id = self.scope['url_route']['kwargs']['room_id']
        user_id = self.scope['user'].id
        self.response = {"TYPE": "UNKNOWN", "error": True, "message": "This action is not allowed!"}

        try:
            data = json.loads(text_data)
        except ValueError:
            data = {"TYPE": "UNKNOWN"}

        if data["TYPE"] == types.PLAYER_SET_DOT:
            if await self.is_allowed_to_set_point(user_id, room_id):
                size = await self.get_field_size(room_id)
                field = GameFieldSerializer().from_database(
                    await self.get_game_field(room_id, user_id), size, size
                )
                point = Point(data["fieldPoint"][0], data["fieldPoint"][1])

                new_field = field
                try:
                    new_field = Core.process_point(field, point, user_id)
                    await self.update_field(
                        GameFieldSerializer().to_database(new_field),
                        room_id
                    )
                    await self.change_player_turn(room_id)
                except Exception as e:
                    print("EXCEPTION", e)

                is_full = Field.is_full_field(new_field)
                new_field = GameFieldSerializer().to_client(new_field)
                new_field["is_full"] = is_full
                new_field["colors"] = await self.get_user_colors(room_id)
                new_field["turn"] = await self.get_who_has_turn(room_id)
                self.response = {"TYPE": types.PLAYER_SET_DOT, "error": False, "data": new_field}

        elif data["TYPE"] == types.PLAYER_GIVE_UP:
            room_group_name = "game_room_" + self.scope['url_route']['kwargs']['room_id']
            await self.channel_layer.group_discard(room_group_name, self.channel_name)

        await self.channel_layer.group_send(
            'game_room_' + room_id,
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
    def get_field_size(self, room_id):
        return GameRoom.objects.get(id=room_id).size

    @database_sync_to_async
    def get_game_field(self, room_id, user_id):
        game = UserGame.objects.filter(user=user_id, game_room=room_id)
        if game.exists():
            return game.get().game_room.field

    @database_sync_to_async
    def get_user_colors(self, room_id):
        data = UserGame.objects.filter(game_room__id=room_id).all()
        colors = {}
        for color in data:
            colors[color.user.id] = color.color
        return colors

    @database_sync_to_async
    def update_field(self, field, room_id):
        GameRoom.objects.filter(id=room_id).update(field=field)

    @database_sync_to_async
    def change_player_turn(self, room_id):
        user1, user2 = UserGame.objects.filter(game_room=room_id).all()
        user1.turn = not user1.turn
        user2.turn = not user2.turn
        user1.save()
        user2.save()
        if user1.turn:
            return user1.user.username
        return user2.user.username

    @database_sync_to_async
    def close_current_game(self, room_id):
        is_room = GameRoom.objects.filter(id=room_id)
        if is_room.exists():
            room = GameRoom.objects.get(id=room_id)
            if room.is_started:
                room.is_ended = True
                room.save()
            else:
                room.delete()

    @database_sync_to_async
    def is_allowed_to_set_point(self, user_id, room_id):
        data = UserGame.objects.filter(user=user_id, game_room=room_id).values_list('game_room__is_started', 'turn').get()
        return data[0] and data[1]

    @database_sync_to_async
    def get_who_has_turn(self, room_id):
        return UserGame.objects.get(game_room_id=room_id, turn=True).user.id
