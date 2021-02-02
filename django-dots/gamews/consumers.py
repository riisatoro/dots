import json
from . import types
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db import transaction
from asgiref.sync import async_to_sync

from api.models import GameRoom, UserGame
from api.game.core import Core, Field
from api.game.serializers import GameFieldSerializer
from api.game.structure import Point


class GameRoomConsumer(AsyncWebsocketConsumer):
    groups = ['global']

    async def connect(self):
        user_group = str(self.scope["user"].id)
        if self.scope["user"].is_authenticated:
            await self.accept()
            self.groups.append(user_group)
            await self.channel_layer.group_add('global', user_group)
            await self.channel_layer.group_add(user_group, f'user_group_{user_group}')
        else:
            await self.close()

    async def disconnect(self, close_code=404):
        await self.close()

    async def receive(self, text_data=None, bytes_data=None):
        response = {
            "type": "",
            "data": {}
        }
        try:
            data = json.loads(text_data)
        except ValueError:
            data = {'type': types.INVALID_JSON}
            response = {'type': types.INVALID_JSON, 'data': {}}

        if data["type"] == types.PLAYER_SET_DOT:
            user = self.scope["user"].id
            room = data["currentGame"]
            point = Point(data["point"][0], data["point"][1])

            if await self.is_allowed_to_set_point(user, room):
                size = await self.get_field_size(room)
                field = GameFieldSerializer().from_database(
                    await self.get_game_field(room, user), size, size
                )

                try:
                    field = Core.process_point(field, point, user)
                    await self.save_field_and_change_turn(room, field)
                    await self.save_score(room, field.score)
                except Exception as e:
                    print("EXCEPTION", e)

                is_full = Field.is_full_field(field)
                field = GameFieldSerializer().to_client(field)
                field["is_full"] = is_full
                field["players"] = await self.get_players_data(room)
                field["turn"] = await self.get_who_has_turn(room)
                response = {"type": types.PLAYER_SET_DOT, "data": {"room": room, "field": field}}

                await self.channel_layer.group_send(
                    "global",
                    {
                        "type": "global_update",
                        "message": {
                            "type": types.PLAYER_SET_DOT,
                            "data": json.dumps(response),
                        }
                    }
                )
            else:
                await self.send(json.dumps(response))

    async def global_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def get_field_size(self, room_id):
        return GameRoom.objects.get(id=room_id).size

    @database_sync_to_async
    def get_game_field(self, room_id, user_id):
        game = UserGame.objects.filter(user=user_id, game_room=room_id)
        if game.exists():
            return game.get().game_room.field

    @database_sync_to_async
    def get_players_data(self, room_id):
        data = UserGame.objects.filter(game_room__id=room_id).all()
        players = {}
        for player in data:
            players[player.user.id] = {
                "username": player.user.username,
                "color": player.color,
            }
        return players

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

    @database_sync_to_async
    def save_field_and_change_turn(self, room, field):
        user1, user2 = UserGame.objects.filter(game_room=room).all()
        user1.turn = not user1.turn
        user2.turn = not user2.turn
        with transaction.atomic():
            GameRoom.objects.filter(id=room).update(
                field=GameFieldSerializer().to_database(field)
            )
            user1.save()
            user2.save()

    @database_sync_to_async
    def save_score(self, room, score):
        for key in score:
            UserGame.objects.filter(game_room=room, user=key).update(score=score[key])


def send_updated_rooms(rooms):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        'global',
        {
            'type': 'global_update',
            'message': {
                "type": types.UPDATE_AVAILABLE_ROOMS,
                "data": rooms
            }
        })
