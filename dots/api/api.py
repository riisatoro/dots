from rest_framework import viewsets
from rest_framework import generics
from rest_framework import permissions
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
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
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.UserSerializer


class Login(APIView):
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        if request.user.is_authenticated:
            return Response({"auth": True})
        return Response({"auth": False})

