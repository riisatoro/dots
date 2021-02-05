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
    INVALID_DATA,
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

    async def receive(self, text_data=None):
        try:
            game_updates = json.loads(text_data)
            player, room_id = await self.get_player_and_room(self.scope, game_updates)

            if game_updates['type'] == PLAYER_SET_DOT:
                point = await self.get_game_point(game_updates)
                response, recipients = await self.get_response_player_set_dot(player, room_id, point)

            elif game_updates['type'] == PLAYER_JOIN_GAME:
                response, recipients = await self.get_player_join_response(player, room_id)

            elif game_updates['type'] == PLAYER_LEAVE:
                response = {'data': {'room': room_id}}
                recipients = await self.get_players_data(room_id)

            for rec in recipients:
                await send_updated_rooms(rec, game_updates['type'], response)

        except Exception:
            await send_updated_rooms(
                self.scope['user'].id, INVALID_DATA, {'type': INVALID_DATA}
            )

    async def global_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    async def get_player_and_room(self, scope, updates):
        return scope['user'].id, int(updates['currentGame'])

    async def get_game_point(self, updates):
        raw_point = updates['point']
        return Point(raw_point[0], raw_point[1])

    async def load_old_field(self, player, room):
        raw_field = await self.get_field(room)
        if raw_field is None:
            raise ValueError('Field is None. This game room does not exists')
        return GameFieldSerializer().from_database(
            raw_field.field,
            height=raw_field.size,
            width=raw_field.size,
        )

    async def make_move(self, old_field, room_id, point, player):
        if not await self.is_allowed_to_set_point(player, room_id):
            raise ValueError('This player is not allowed to set point')
        return Core.process_point(old_field, point, player)

    async def serialize_game_data(self, new_field, room_id, is_field_full):
        field = GameFieldSerializer().to_client(new_field)
        field['score'] = Field.get_score_from_raw(field['field'], field['players'])
        field['turn'] = await self.get_who_has_turn(room_id)
        field['players'] = await self.get_players_data(room_id)
        field['is_full'] = is_field_full
        return field

    async def get_player_join_response(self, player, room_id):
        old_field = await self.load_old_field(player, room_id)
        new_field = Field.add_player(old_field, player)
        serialized_field = await self.serialize_game_data(new_field, room_id, False)
        return (
            {'type': PLAYER_JOIN_GAME, 'data': {'room': room_id, 'field': serialized_field}},
            serialized_field['players']
        )

    async def get_response_player_set_dot(self, player, room_id, point):
        old_field = await self.load_old_field(player, room_id)
        new_field = await self.make_move(old_field, room_id, point, player)
        await self.save_field_and_change_turn(room_id, new_field)
        await self.save_score(room_id, new_field.score)
        is_field_full = Field.is_full_field(new_field)
        if is_field_full:
            await self.close_current_game(room_id)
        serialized_field = await self.serialize_game_data(new_field, room_id, is_field_full)
        return (
            {'type': PLAYER_SET_DOT, 'data': {'room': room_id, 'field': serialized_field}},
            serialized_field['players']
        )

    @database_sync_to_async
    def get_field(self, room_id):
        return GameRoom.objects.filter(id=room_id).first()

    @database_sync_to_async
    def get_players_data(self, room_id):
        data = UserGame.objects.filter(game_room=room_id).all()
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
        data = UserGame.objects.filter(user=user_id, game_room=room_id).values_list('game_room__is_started', 'turn').first()
        if data is not None:
            return data[0] and data[1]
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
