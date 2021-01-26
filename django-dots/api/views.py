from django.contrib.auth import login, logout, authenticate
from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

from . import serializers, models, senders
from .game.core import Field
from .game.serializers import GameFieldSerializer


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


class Register(APIView):
    """Registration"""
    def post(self, request):
        email = request.data["email"]
        username = request.data["username"]
        password = request.data["password"]

        
        
        if User.objects.filter(username=username).exists():
            return Response({
                "error": True,
                "message": "This username already registered."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        if User.objects.filter(email=email).exists():
            return Response({
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
        free_rooms = models.UserGame.objects.filter(game_room__is_started=False)
        return Response(
            {"free_room": serializers.UserGameSerializer(free_rooms, many=True).data}
        )

    def post(self, request):
        data = request.data
        size = data["size"]
        already_waiting = models.GameRoom.objects.filter(
            players=request.user, is_ended=False
        ).exists()
        if already_waiting:
            return Response(
                {
                    "error": True,
                    "message": "Unexpected color or user already created a room.",
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        field = Field.add_player(Field.create_field(size, size), request.user.id)
        room = models.GameRoom(
            field=GameFieldSerializer().to_database(field), size=size
        )

        try:
            room.full_clean()
            room.save()
        except ValidationError:
            return Response(
                {"error": True, "message": "Unexpected field size."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        user_game = models.UserGame(
            user=request.user, game_room=room, color=data["color"]
        )
        user_game.save()

        senders.NewGameSender().send_signal()

        return Response(
            {
                "error": False,
                "message": "Room was created!",
                "room_id": room.id,
                "field": room.field,
                "field_size": room.size,
                "turn": request.user.id,
                "colors": {request.user.id: data["color"]},
                "score": {request.user.id: 0},
            }
        )


class GameRoomJoin(APIView):
    """Allow users join to the room and start the game"""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response()

    def post(self, request):
        already_joined = models.GameRoom.objects.filter(
            players=request.user, is_ended=False
        ).exists()

        if already_joined:
            return Response(
                {"error": True, "message": "User already playing or created a room."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

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
        colors = {}
        score = {}
        for color in data:
            colors[color.user.id] = color.color
            score[color.user.id] = 0

        senders.NewGameSender().send_signal()
        return Response(
            {
                "error": False,
                "field": room.field,
                "field_size": room.size,
                "room_id": room_id,
                "turn": data[0].user.id,
                "colors": colors,
                "score": score,
            }
        )


class GameRoomLeave(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response()

    def post(self, request):
        models.UserGame.objects.filter(
            user=request.user, game_room__is_started=True, game_room__is_ended=False
        ).update(room__is_ended=True)
        return Response()
