from rest_framework import viewsets, generics, permissions
from django.contrib.auth import login, logout, authenticate, get_user_model

from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

from . import serializers
from . import models


class Register(APIView):
    def get(self, request, format=None):
        return Response({"error": True, "message": "Can't create user from the GET request."})

    def post(self, request, format=None):
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
        token, created = Token.objects.get_or_create(user=user)
        return Response({"error": False, "token": str(token)})


class MatchViewSet(APIView):
    permission_classes = (IsAuthenticated, )
    queryset = models.Match.objects.all()
    serializer_class = serializers.MatchSerializer

    def get(self, request, format=None):
        data = serializers.MatchSerializer(models.Match.objects.filter(user=request.user), many=True)
        return Response(data.data)

    def post(self, request, format=None):
        data = request.data
        data["user"] = request.user.id

        series = serializers.MatchSerializer(data=data)
        if series.is_valid():  
            data = series.save()
            data = serializers.MatchSerializer(data)
            return Response({"error": False})
        return Response({"error": True, "message": series.errors})


class Logout(APIView):
    def get(self, request, format=None):
        logout(request)
        return Response({"error": False})

    def post(self, request, format=None):
        logout(request)
        return Response({"error": False})


class Login(APIView):
    def post(self, request, format=None):
        body = request.data
        user = authenticate(
            username=body["username"], 
            password=body["password"]
            )
        if user:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({"error": False, "token": str(token)})
        return Response({"error": True, "message": "Invalid username or password"})
