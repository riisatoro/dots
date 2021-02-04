import json

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.db import transaction

from api.models import GameRoom, UserGame
from api.game.core import Core, Field
from api.game.serializers import GameFieldSerializer
from api.game.structure import Point
from gamews.types import (
    INVALID_JSON,
    PLAYER_SET_DOT,
    PLAYER_JOIN_GAME,
    PLAYER_LEAVE,
    UPDATE_AVAILABLE_ROOMS
)


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['user'].is_authenticated:
            await self.accept()
            user_group = str(self.scope['user'].id)
            await self.channel_layer.group_add('global', self.channel_name)
            await self.channel_layer.group_add(user_group, self.channel_name)
        else:
            await self.close()

    async def disconnect(self, close_code=404):
        await self.channel_layer.group_discard('global', self.channel_name)
        await self.channel_layer.group_discard(str(self.scope['user'].id), self.channel_name)
        await self.close()

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
        except ValueError:
            data = {'type': INVALID_JSON}
            response = {'type': INVALID_JSON, 'data': {}}

        if data['type'] == PLAYER_SET_DOT:
            user = self.scope['user'].id
            room = data['currentGame']
            point = Point(data['point'][0], data['point'][1])

            if await self.is_allowed_to_set_point(user, room):
                size = await self.get_field_size(room)
                game_field = await self.get_game_field(room, user)
                field = GameFieldSerializer().from_database(
                    game_field, height=size, width=size
                )

                try:
                    field = Core.process_point(field, point, user)
                    await self.save_field_and_change_turn(room, field)
                    await self.save_score(room, field.score)
                except Exception as e:
                    print('EXCEPTION', e)

                is_full = Field.is_full_field(field)
                field = GameFieldSerializer().to_client(field)
                field['is_full'] = is_full
                field['players'] = await self.get_players_data(room)
                field['turn'] = await self.get_who_has_turn(room)
                response = {'type': PLAYER_SET_DOT, 'data': {'room': room, 'field': field}}

                if is_full:
                    await self.close_current_game(room)

                for player in field['players']:
                    await self.channel_layer.group_send(
                        str(player),
                        {
                            'type': 'global_update',
                            'message': {
                                'type': PLAYER_SET_DOT,
                                'data': json.dumps(response),
                            }
                        }
                    )

        elif data['type'] == PLAYER_JOIN_GAME:
            user = self.scope['user'].id
            room = data['currentGame']

            size = await self.get_field_size(room)
            field = GameFieldSerializer().from_database(
                await self.get_game_field(room, user), size, size
            )
            field = Core.process_point(field, Point(0, 0), user)
            is_full = Field.is_full_field(field)
            field = GameFieldSerializer().to_client(field)
            field['is_full'] = is_full
            field['players'] = await self.get_players_data(room)
            field['turn'] = await self.get_who_has_turn(room)
            response = {'type': PLAYER_JOIN_GAME, 'data': {'room': room, 'field': field}}
            for player in field['players']:
                await self.channel_layer.group_send(
                    str(player),
                    {
                        'type': 'global_update',
                        'message': {
                            'type': PLAYER_JOIN_GAME,
                            'data': json.dumps(response),
                        }
                    }
                )

        elif data['type'] == PLAYER_LEAVE:
            user = self.scope['user'].id
            room = data['currentGame']
            players = await self.get_players_data(room)

            response = {'data': {'room': room}}
            for player in players:
                await self.channel_layer.group_send(
                    str(player),
                    {
                        'type': 'global_update',
                        'message': {
                            'type': PLAYER_LEAVE,
                            'data': json.dumps(response),
                        }
                    }
                )

        else:
            await self.send(json.dumps({'type': INVALID_JSON}))

    async def global_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def get_field_size(self, room_id):
        return GameRoom.objects.get(id=room_id).size

    @database_sync_to_async
    def get_game_field(self, room_id, user):
        return GameRoom.objects.get(id=room_id).field

    @database_sync_to_async
    def get_players_data(self, room_id):
        data = UserGame.objects.filter(game_room__id=room_id).all()
        return {
            player.user.id: {
                'username': player.user.username,
                'color': player.color
            } for player in data
        }

    @database_sync_to_async
    def close_current_game(self, room):
        GameRoom.objects.filter(id=room).update(is_ended=True)

    @database_sync_to_async
    def is_allowed_to_set_point(self, user_id, room_id):
        try:
            data = UserGame.objects.filter(user=user_id, game_room=room_id).values_list('game_room__is_started', 'turn').get()
            return data[0] and data[1]
        except Exception:
            return False

    @database_sync_to_async
    def get_who_has_turn(self, room_id):
        return UserGame.objects.get(game_room_id=room_id, turn=True).user.id

    @database_sync_to_async
    def save_field_and_change_turn(self, room, field):
        user1, user2 = UserGame.objects.filter(game_room=room).all()
        user2.turn = user1.turn
        user1.turn = not user1.turn
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

"""
def send_updated_rooms(group: str, type: str, reply: dict):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        str(group),
        {
            'type': 'global_update',
            'message': {
                'type': type,
                'data': reply
            }
        })
"""

def send_updated_rooms(rooms):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        'global',
        {
            'type': 'global_update',
            'message': {
                'type': UPDATE_AVAILABLE_ROOMS,
                'data': rooms
            }
        })
