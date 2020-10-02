import json

from rest_framework import viewsets
from rest_framework import generics
from rest_framework import permissions
from django.contrib.auth import login
from django.contrib.auth import logout
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BasicAuthentication

from . import serializers
from . import models


class MatchViewSet(APIView):
    queryset = models.Match.objects.all()
    serializer_class = serializers.MatchSerializer

    def get(self, request, format=None):
        data = []
        for el in models.Match.objects.all(): 
            data.append(serializers.MatchSerializer(el).data)
        return Response(data)

    def post(self, request, format=None):
        series = serializers.MatchSerializer(data=request.data)
        if series.is_valid():            
            data = series.save()
            data = serializers.MatchSerializer(data)
        return Response(data.data)


class Register(generics.CreateAPIView):
    model = get_user_model()
    serializer_class = serializers.UserSerializer


class Login(APIView):
    def post(self, request, format=None):
        
        body = request.data
        user = authenticate(
            username=body["username"], 
            password=body["password"]
            )
        if user:
            login(request, user)
            return Response({"auth": True})
        raise AuthenticationFailed("Invalid username or password")


class Logout(APIView):
    def get(self, request, format=None):
        logout(request)
        return Response({"auth": False})