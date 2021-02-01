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
        channel_name = "global"
        room_name = str(self.scope["user"].id)
        if self.scope["user"].is_authenticated:
            await self.channel_layer.group_add(
                room_name,
                channel_name
            )
            await self.accept()
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

        # if data["TYPE"] == types.PLAYER_SET_DOT:
        #     if await self.is_allowed_to_set_point(user_id, room_id):
        #         size = await self.get_field_size(room_id)
        #         field = GameFieldSerializer().from_database(
        #             await self.get_game_field(room_id, user_id), size, size
        #         )
        #         point = Point(data["fieldPoint"][0], data["fieldPoint"][1])

        #         new_field = field
        #         try:
        #             new_field = Core.process_point(field, point, user_id)
        #             await self.save_field_and_change_turn(room_id, new_field)
        #             await self.save_score(room_id, new_field.score)
        #         except Exception as e:
        #             print("EXCEPTION", e)

        #         is_full = Field.is_full_field(new_field)
        #         new_field = GameFieldSerializer().to_client(new_field)
        #         new_field["is_full"] = is_full
        #         new_field["players"] = await self.get_players_data(room_id)
        #         new_field["turn"] = await self.get_who_has_turn(room_id)
        #         self.response = {"TYPE": types.PLAYER_SET_DOT, "error": False, "data": new_field}

        # elif data["TYPE"] == types.PLAYER_GIVE_UP:
        #     room_group_name = "game_room_" + self.scope['url_route']['kwargs']['room_id']
        #     await self.channel_layer.group_discard(room_group_name, self.channel_name)

        await self.send(json.dumps(response))

    async def chat_message(self, event):
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
            players[color.user.id] = {
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
        "global",
        {
            'type': 'chat_message',
            'message': {
                "type": types.UPDATE_AVAILABLE_ROOMS,
                "data": rooms
            }
        })
