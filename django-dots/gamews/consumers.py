import json

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.db import transaction

from api.game.core import Core, Field
from api.game.serializers import GameFieldSerializer
from api.game.structure import Point, GameField
from api.models import GameRoom, UserGame
from gamews.types import (INVALID_DATA, PLAYER_JOIN_GAME, PLAYER_LEAVE,
                          PLAYER_SET_DOT, UPDATE_AVAILABLE_ROOMS, INVALID_JSON,
                          INVALID_POINT)


async def send_updated_rooms(group: str, type_reply: str, reply: dict):
    layer = get_channel_layer()
    await layer.group_send(
        str(group),
        {
            'type': 'global_update',
            'message': {
                'type': type_reply,
                'data': json.dumps(reply)
            }
        }
    )


def send_rooms(reply: dict):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        'global',
        {
            'type': 'global_update',
            'message': {
                'type': UPDATE_AVAILABLE_ROOMS,
                'data': reply
            }
        }
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

    async def receive(self, text_data=None):
        try:
            game_updates = json.loads(text_data)
            player_id = self.scope['user'].id
            room_id = int(game_updates['currentGame'])

            if game_updates['type'] == PLAYER_SET_DOT:
                point = Point(game_updates['point'][0], game_updates['point'][1])
                response, recipients = await self.get_player_set_dot_response(player_id, room_id, point)

            elif game_updates['type'] == PLAYER_JOIN_GAME:
                response, recipients = await self.get_player_join_response(player_id, room_id)

            elif game_updates['type'] == PLAYER_LEAVE:
                response = {'data': {'room': room_id}}
                recipients = await self.get_players(room_id)

        except KeyError:
            await send_updated_rooms(
                self.scope['user'].id, INVALID_JSON, {'type': INVALID_JSON}
            )
        except ValueError:
            await send_updated_rooms(
                self.scope['user'].id, INVALID_DATA, {'type': INVALID_DATA}
            )
        except IndexError:
            await send_updated_rooms(
                self.scope['user'].id, INVALID_POINT, {'type': INVALID_POINT}
            )
        else:
            for rec in recipients:
                await send_updated_rooms(rec, game_updates['type'], response)

    async def get_player_set_dot_response(self, player_id: int, room_id: int, point: Point):
        old_field = await self.load_old_field(room_id)
        new_field = await self.make_move(old_field, room_id, point, player_id)
        await self.update_players_stats(room_id, new_field)
        if is_field_full := Field.is_full_field(new_field):
            await self.close_current_game(room_id)
        serialized_field = await self.serialize_game_data(new_field, room_id, is_field_full)
        return (
            {
                'type': PLAYER_SET_DOT,
                'data': {
                    'room': room_id,
                    'field': serialized_field
                }
            },
            serialized_field['players']
        )

    async def get_player_join_response(self, player_id: int, room_id: int):
        old_field = await self.load_old_field(room_id)
        new_field = Field.add_player(old_field, player_id)
        serialized_field = await self.serialize_game_data(new_field, room_id, False)
        return (
            {
                'type': PLAYER_JOIN_GAME,
                'data': {
                    'room': room_id,
                    'field': serialized_field
                }
            },
            serialized_field['players']
        )

    @database_sync_to_async
    def get_players(self, room_id: int):
        return list(
            UserGame.objects.filter(game_room=room_id).values_list('user__id', flat=True)
        )

    async def load_old_field(self, room_id: int):
        if raw_field := await self.get_field(room_id):
            return GameFieldSerializer().from_database(
                raw_field.field,
                height=raw_field.size,
                width=raw_field.size,
            )
        raise ValueError('Field is None. This game room does not exists')

    async def make_move(self, old_field: GameField, room_id: int, point: Point, player_id: int):
        if await self.is_allowed_to_set_point(player_id, room_id):
            return Core.process_point(old_field, point, player_id)
        raise ValueError('This player is not allowed to set point')

    @database_sync_to_async
    def update_players_stats(self, room_id: int, field: GameField):
        user1, user2 = UserGame.objects.filter(game_room=room_id).all()
        user2.turn = user1.turn
        user2.score = field.score[user2.user.id]
        user1.turn = not user1.turn
        user1.score = field.score[user1.user.id]
        with transaction.atomic():
            GameRoom.objects.filter(id=room_id).update(
                field=GameFieldSerializer().to_database(field)
            )
            user1.save()
            user2.save()

    @database_sync_to_async
    def close_current_game(self, room_id: int):
        GameRoom.objects.filter(id=room_id).update(is_ended=True)

    async def serialize_game_data(self, new_field: GameField, room_id: int, is_field_full: bool):
        field = GameFieldSerializer().to_client(new_field)
        field['score'] = Field.get_score_from_raw(field['field'], field['players'])
        field['turn'] = await self.get_who_has_turn(room_id)
        field['players'] = await self.get_players_data(room_id)
        field['is_full'] = is_field_full
        return field

    @database_sync_to_async
    def get_field(self, room_id: int):
        return GameRoom.objects.filter(id=room_id).first()

    @database_sync_to_async
    def get_who_has_turn(self, room_id: int):
        return UserGame.objects.get(game_room_id=room_id, turn=True).user.id

    @database_sync_to_async
    def get_players_data(self, room_id: int):
        players = UserGame.objects.filter(game_room=room_id).all()
        return {
            player.user.id: {
                'username': player.user.username,
                'color': player.color
            } for player in players
        }

    @database_sync_to_async
    def is_allowed_to_set_point(self, user_id: int, room_id: int):
        data = UserGame.objects.filter(
            user=user_id, game_room=room_id
        ).values_list(
            'game_room__is_started', 'turn'
        ).first()
        return False if data is None else data[0] and data[1]

    async def global_update(self, event: dict):
        message = event['message']
        await self.send(text_data=json.dumps(message))
