from django.contrib.auth import login, logout, authenticate
from django.http import HttpResponse

from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

from . import serializers
from . import models
from .game import main as game_logic


class Main(APIView):
    """Main url just to check if server works"""
    def get(self, request):
        return HttpResponse('OK')

    def post(self, request):
        return HttpResponse('OK')


class Register(APIView):
    """Registration"""
    def get(self, request):
        return Response({"error": True, "message": "Can't create user from the GET request."})

    def post(self, request):
        username = request.data["username"]
        password = request.data["password"]
        email = request.data["email"]

        username_exists = User.objects.filter(username=username).exists()
        email_exists = User.objects.filter(email=email).exists()
        if email_exists:
            return Response({"error": True, "message": "This email already registered."})
        if username_exists:
            return Response({"error": True, "message": "This username already registered."})

        user = User.objects.create_user(username, email, password)
        token = Token.objects.get_or_create(user=user)[0]
        return Response({"error": False, "token": str(token)})


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
        user = authenticate(
            username=body["username"],
            password=body["password"]
            )
        if user:
            login(request, user)
            token = Token.objects.get_or_create(user=user)[0]
            return Response({"error": False, "token": str(token)})
        return Response({"error": True, "message": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)


class MatchViewSet(APIView):
    """Allow logged users get match results and save their own"""
    permission_classes = (IsAuthenticated, )
    queryset = models.Match.objects.all()
    serializer_class = serializers.MatchSerializer

    def get(self, request):
        data = serializers.MatchSerializer(
            models.Match.objects.filter(user=request.user), many=True)
        return Response(data.data)

    def post(self, request):
        data = request.data
        data["user"] = request.user.id

        series = serializers.MatchSerializer(data=data)
        if series.is_valid():
            data = series.save()
            data = serializers.MatchSerializer(data)
            return Response({"error": False})
        return Response({"error": True, "message": series.errors})


class GameRoomView(APIView):
    """Get free rooms or create a new one"""
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        free_rooms = models.UserGame.objects.filter(game_room__is_started = False)
        return Response(
            {"free_room": serializers.UserGameSerializer(free_rooms, many=True).data})

    def post(self, request):
        data = request.data
        
        size = data["size"]
        already_waiting = models.GameRoom.objects.filter(players=request.user, is_ended=False).exists()
        if not already_waiting and size in range(5, 15):
            room = models.GameRoom(field = [["E"]*size]*size, size=size)
        else:
            return Response({"error": True, "message": "Unexpected color or field size, or user already created a room."}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            room.full_clean()
        except Exception as E:
            return Response({"error": True, "message": "Unexpected field size."}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        room.save()
        user_game = models.UserGame(user=request.user, game_room=room, color=data["color"])
        user_game.save()
        room.save()

        return Response({"error": False, "message": "Room was created!", "room_id": room.id})


class GameRoomJoin(APIView):
    """Allow users join to the room and start the game"""
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        return Response()

    def post(self, request):
        already_joined = models.GameRoom.objects.filter(players=request.user, is_ended=False).exists()

        if not already_joined:
            room_id = request.data["room_id"]
            owner = models.UserGame.objects.filter(
                game_room__id = room_id, game_room__is_started = False)\
                .exclude(user=request.user)

            room = models.GameRoom.objects.filter(id = room_id)
            if room.exists() and owner.exists():
                owner = owner.get()
                room = room.get()
                #
                user_game = models.UserGame(user=request.user, game_room = room, color=request.data["color"])
                user_game.save()
                # start a new game in this room and give the first turn
                room.is_started = True
                owner.turn = True
                room.save()
                owner.save()
                return Response({"error": False, "start_game": True})
            else:
                return Response({"error": True, "message": "Room does not exists."},
                                status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        else:
            # дать возможность выйти/закончить игру, отправив её айдишник
            return Response({"error": True, "message": "User already playing or created a room."},
                            status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class SetPoint(APIView):
    """ Update game field and change the player turn """
    def get(self, request):
        return Response()

    def post(self, request):
        game = models.UserGame.objects.filter(
            user=request.user, turn=True,
            game_room__is_started=True, game_room__is_ended=False)
        if game.exists():
            game = game.get()
            room_id = game.game_room.id

            # get previous game field to change the point
            field = game.game_room.field
            point = request.data["point"]
            # check if this point is available for updates
            if field[point[0]][point[1]] == "E":
                field[point[0]][point[1]] = game.color
                new_field = models.GameRoom.objects.get(id=room_id)

                # process the game field, receiving the colors for all players
                colors = models.UserGame.objects.filter(game_room__id=room_id).values_list('color').all()
                new_field.field = game_logic.process(field, colors)
                new_field.save()
            else:
                return Response({"error": True, "message": "This point is not available."},
                                status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            # change the turn of the player | will work only when 2 user are playing
            # set end of the turn for this player
            this_player = models.UserGame.objects.filter(game_room__id=room_id, turn=True).get()
            next_player = models.UserGame.objects.filter(game_room__id=room_id, turn=False).get()
            this_player.turn = False
            next_player.turn = True
            this_player.save()
            next_player.save()

            return Response({"field": game.game_room.field})

        return Response({"error": True, "message": "Now is not your turn"},
                        status = status.HTTP_422_UNPROCESSABLE_ENTITY)


class GameRoomLeave(APIView):
    def get(self, request):
        return Response()

    def post(self, request):
        # get two players
        room = models.UserGame.objects.filter(
            user=request.user, game_room__is_started=True, game_room__is_ended=False)\
            .get().game_room
        room.is_ended = True
        room.save()
        return Response()