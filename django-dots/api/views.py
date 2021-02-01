from django.contrib.auth import login, logout, authenticate
from django.core.exceptions import ValidationError

from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

from . import serializers, models
from .game.core import Field
from .game.serializers import GameFieldSerializer
from gamews.consumers import send_updated_rooms


def create_new_room(user, size, color):
    field = Field.add_player(Field.create_field(size, size), user.id)
    room = models.GameRoom(
        field=GameFieldSerializer().to_database(field), size=size
    )
    room.full_clean()
    room.save()
    with transaction.atomic():
        user_game = models.UserGame(
            user=user, game_room=room, color=color
        )
        user_game.save()

def group_player_score(games):
    all_games_id = {x.game_room for x in games}
    result = [
        [
            {"player": data.user.username, "color": data.color, "captured": data.score}
            for data in games
            if data.game_room == game_id
        ]
        for game_id in all_games_id
    ]
    return result

def group_player_rooms(user):
    room_data = {}
    player_rooms = models.UserGame.objects.filter(
        game_room__in=models.UserGame.objects.filter(user=user).values_list('game_room', flat=True),
        game_room__is_started=False
    )
    player_rooms = serializers.UserGameSerializer(player_rooms, many=True).data

    for room in player_rooms:
        field = room.get('game_room').get('field')
        size = room.get('game_room').get('size')
        field = GameFieldSerializer().to_client(
            GameFieldSerializer().from_database(field, size, size)
        )
        key = room.get('game_room').get('id')
        room_data[key] = {
            "size": size,
            "players": {},
            "field": field
        }

    for room in player_rooms:
        key = room.get('game_room').get('id')
        player = room.get('user').get('id')
        room_data[key]["players"][player] = {
            "username": room.get('user').get('username'),
            "color": room.get('color'),
        }
    return room_data


class Register(APIView):
    """Registration"""
    def post(self, request):
        email = request.data["email"]
        username = request.data["username"]
        password = request.data["password"]

        if User.objects.filter(username=username).exists():
            return Response(
                {
                    "error": True,
                    "message": "This username already registered."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        if User.objects.filter(email=email).exists():
            return Response(
                {
                    "error": True,
                    "message": "This email already registered.",
                },
                status=status.HTTP_403_FORBIDDEN
            )

        user = User.objects.create_user(username, email, password)
        token = Token.objects.get_or_create(user=user)[0]
        return Response(
            {"error": False, "username": username, "token": str(token), "id": user.id}
        )


class Logout(APIView):
    """Logout user"""

    def get(self, request):
        logout(request)
        return Response({"error": False})

    def post(self, request):
        logout(request)
        return Response({"error": False})


class Login(APIView):
    """Login user by username and passwords; returns token"""

    def post(self, request):
        body = request.data
        user = authenticate(username=body["username"], password=body["password"])
        if user:
            login(request, user)
            token = Token.objects.get_or_create(user=user)[0]
            return Response(
                {
                    "error": False,
                    "username": body["username"],
                    "token": str(token),
                    "id": token.user.id,
                }
            )
        return Response(
            {"error": True, "message": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class MatchViewSet(APIView):
    """Allow logged users get match results and save their own"""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        score = group_player_score(
            models.UserGame.objects.filter(
                game_room__in=models.UserGame.objects.filter(user=1).values("game_room")
            ).all()
        )
        return Response({"error": False, "data": score})

    def post(self, request):
        return Response({"error": True, "message": "Deprecated"})


class GameRoomView(APIView):
    """Get free rooms or create a new one"""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        free_rooms = models.UserGame.objects.filter(game_room__is_started=False).exclude(user=request.user)
        rooms = group_player_rooms(request.user)
        return Response(
            {
                "free_rooms": serializers.UserGameSerializer(free_rooms, many=True).data,
                "user_rooms": rooms
            }
        )

    def post(self, request):
        color = request.data["color"]
        size = request.data["size"]

        try:
            room = create_new_room(request.user, size, color)
        except ValidationError:
            return Response(
                {"error": True, "message": "Unexpected field size."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        except Exception:
            return Response(
                {"error": True, "message": "Server error. Try later"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        send_updated_rooms(
            serializers.UserGameSerializer(
                models.UserGame.objects.filter(game_room__is_started=False),
                many=True
            ).data
        )

        player_rooms = group_player_rooms(request.user)
        return Response(
            {
                "error": False,
                "message": "Room was created!",
                "data": player_rooms,
            }
        )


class GameRoomJoin(APIView):
    """Allow users join to the room and start the game"""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response()

    def post(self, request):
        room_id = request.data["room_id"]
        owner = models.UserGame.objects.filter(
            game_room__id=room_id, game_room__is_started=False
        ).exclude(user=request.user)

        room = models.GameRoom.objects.filter(id=room_id)
        if not room.exists() or not owner.exists():
            return Response(
                {"error": True, "message": "Room does not exists."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        owner = owner.get()
        room = room.get()

        user_game = models.UserGame(
            user=request.user, game_room=room, color=request.data["color"]
        )
        user_game.save()

        room.is_started = True
        room.field = GameFieldSerializer().to_database(
            Field.add_player(
                GameFieldSerializer().from_database(room.field, room.size, room.size),
                request.user.id,
            )
        )
        owner.turn = True
        room.save()
        owner.save()

        data = models.UserGame.objects.filter(game_room__id=room.id).all()
        players = {}
        score = {}
        for player in data:
            players[player.user.id] = {
                "username": player.user.username,
                "color": player.color,
            }
            score[player.user.id] = 0

        send_updated_rooms(
            serializers.UserGameSerializer(
                models.UserGame.objects.filter(game_room__is_started=False),
                many=True
            ).data
        )

        return Response(
            {
                "error": False,
                "field": room.field,
                "field_size": room.size,
                "room_id": room_id,
                "turn": data[0].user.id,
                "players": players,
                "score": score,
            }
        )


class GameRoomLeave(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        room = request.data["room"]

        if models.GameRoom.objects.filter(id=room).count() == 1:
            models.GameRoom.objects.get(id=room).delete()
        else:
            models.UserGame.objects.filter(game_room=room, user=request.user).delete()

        send_updated_rooms(
            serializers.UserGameSerializer(
                models.UserGame.objects.filter(game_room__is_started=False),
                many=True
            ).data
        )

        return Response(
            {
                "error": False,
                "message": "Room was created!",
                "data": group_player_rooms(request.user),
            }
        )
