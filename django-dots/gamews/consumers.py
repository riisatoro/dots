import json
from . import types
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import GameRoom, UserGame
from api.game.main import process
from api.game.calc_square import process as find_points
from django.contrib.auth.models import AnonymousUser

from api.game.to_old import ConvertField
from api.game.serializer import GameFieldSerializer


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
                field = await self.get_game_field(room_id, user_id)
                if field:
                    user_color = await self.get_this_user_color(user_id, room_id)
                    colors = await self.get_user_colors(room_id)
                    game_data = process(field, data["fieldPoint"], user_color, colors)
                    await self.update_field(game_data["field"], room_id)
                    if game_data["changed"]:
                        turn = await self.change_player_turn(room_id)
                        captured = await self.get_captured_points(game_data["field"], room_id)
                        game_data["turn"] = turn
                        game_data["captured"] = captured
                    self.response = {"TYPE": types.PLAYER_SET_DOT, "error": False, "data": game_data}

        elif data["TYPE"] == types.PLAYER_GIVE_UP:
            room_group_name = "game_room_" + self.scope['url_route']['kwargs']['room_id']
            await self.channel_layer.group_discard(room_group_name, self.channel_name)

        else:
            self.response = {"TYPE": "UNKNOWN", "error": True, "message": "This action is not allowed!"}

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
    def user_is_auth(self, user):
        if user == AnonymousUser:
            return False
        return True

    @database_sync_to_async
    def get_game_field(self, room_id, user_id):
        game = UserGame.objects.filter(user=user_id, game_room=room_id)
        if game.exists():
            return game.get().game_room.field


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
    def allow_join_room(self, room_id):
        return GameRoom.objects.filter(id=room_id, is_started=False).exists()

    @database_sync_to_async
    def get_captured_points(self, field, room_id):
        players = UserGame.objects.filter(game_room=room_id).all()
        user1, user2 = players[0].user.username, players[1].user.username
        color1, color2 = players[0].color, players[1].color
        captured1, captured2 = find_points(field, color2), find_points(field, color1)
        data = {
            user1: captured1,
            user2: captured2
        }

        player1 = UserGame.objects.filter(game_room=room_id, user__username=user1).get()
        player1.score = captured2
        player1.save()
        player2 = UserGame.objects.filter(game_room=room_id, user__username=user2).get()
        player2.score = captured1
        player2.save()

        return data
