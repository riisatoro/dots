from django.contrib.auth import login, logout, authenticate
from django.core.exceptions import ValidationError

from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

from .game.core import Field
from .game.serializers import GameFieldSerializer
from gamews.consumers import send_updated_rooms
from .models import GameRoom, UserGame
from .serializers import UserGameSerializer


def create_new_room(user, size, color):
    field = Field.add_player(Field.create_field(size, size), user.id)
    room = GameRoom(
        field=GameFieldSerializer().to_database(field), size=size
    )
    room.full_clean()
    room.save()
    with transaction.atomic():
        user_game = UserGame(
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


def group_player_rooms(player_rooms):
    room_data = {}
    for room in player_rooms:
        field = room.get('game_room').get('field')
        size = room.get('game_room').get('size')
        field = GameFieldSerializer().to_client(
            GameFieldSerializer().from_database(field, size, size)
        )
        key = str(room.get('game_room').get('id'))
        turn = 0
        if room.get('turn'):
            turn = room.get('user').get('id')      

        field["is_full"] = Field.is_full_raw(field["field"])
        field["score"] = Field.get_score_from_raw(field['field'], field['players'])

        room_data[key] = {
            "size": size,
            "players": {},
            "field": field,
            "turn": turn,
        }

    for room in player_rooms:
        key = str(room.get('game_room').get('id'))
        player = str(room.get('user').get('id'))
        room_data[key]["players"][player] = {
            "username": room.get('user').get('username'),
            "color": room.get('color'),
        }
    return room_data


def get_games_data(user):
    current = UserGame.objects.filter(
        game_room__is_started=True,
        game_room__is_ended=False,
        game_room__in=UserGame.objects.filter(user=user).values_list('game_room', flat=True)
    ).all()

    waiting = UserGame.objects.filter(
        game_room__is_started=False,
        game_room__in=UserGame.objects.filter(user=user).values_list('game_room', flat=True)
    ).all()

    available = UserGame.objects.filter(game_room__is_started=False).exclude(user=user)

    return {
        "waiting": group_player_rooms(UserGameSerializer(waiting, many=True).data),
        "current": group_player_rooms(UserGameSerializer(current, many=True).data),
        "available": group_player_rooms(UserGameSerializer(available, many=True).data),
    }


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
            UserGame.objects.filter(
                game_room__in=UserGame.objects.filter(user=1).values("game_room")
            ).all()
        )
        return Response({"error": False, "data": score})

    def post(self, request):
        return Response({"error": True, "message": "Deprecated"})


class GameRoomView(APIView):
    """Get free rooms or create a new one"""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        data = get_games_data(request.user)
        return Response(data)

    def post(self, request):
        color = request.data["color"]
        size = request.data["size"]

        try:
            create_new_room(request.user, size, color)
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
        send_updated_rooms(get_games_data(-1))

        data = get_games_data(request.user)
        return Response(data)


class GameRoomJoin(APIView):
    """Allow users join to the room and start the game"""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response()

    def post(self, request):
        room_id = request.data["room_id"]
        owner = UserGame.objects.filter(
            game_room__id=room_id, game_room__is_started=False
        ).exclude(user=request.user)

        room = GameRoom.objects.filter(id=room_id)
        if not room.exists() or not owner.exists():
            return Response(
                {"error": True, "message": "Room does not exists."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        owner = owner.get()
        room = room.get()

        user_game = UserGame(
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

        data = UserGame.objects.filter(game_room__id=room.id).all()
        players = {}
        score = {}
        for player in data:
            players[player.user.id] = {
                "username": player.user.username,
                "color": player.color,
            }
            score[player.user.id] = 0

        send_updated_rooms(get_games_data(-1))

        data = get_games_data(request.user)
        return Response(data)


class GameRoomLeave(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        room = request.data["room"]

        if UserGame.objects.filter(game_room=room).count() == 1:
            GameRoom.objects.get(id=room).delete()
        else:
            GameRoom.objects.filter(id=room).update(is_started=True, is_ended=True)

        send_updated_rooms(get_games_data(-1))
        data = get_games_data(request.user)
        return Response(data)
