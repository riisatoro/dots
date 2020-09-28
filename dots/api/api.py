import json

from rest_framework import viewsets
from rest_framework import generics
from rest_framework import permissions
from django.contrib.auth import login
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


class MatchViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.MatchSerializer

    def get_queryset(self):
        user = self.request.user
        return models.Match.objects.filter(user=user)


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

