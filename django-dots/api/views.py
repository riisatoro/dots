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
            print(E)

        room.save()
        room.players.add(request.user)
        room.save()

        return Response({"error": False, "message": "Room was created!", "room_id": room.id})
