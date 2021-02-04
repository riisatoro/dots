import json

from django.test import TestCase
from asgiref.sync import sync_to_async
from channels.auth import AuthMiddlewareStack
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User

from .consumers import GameRoomConsumer
from dots.routing import application as WsApp

class WebsocketTestCase(TestCase):
    fixtures = ['dump.json']

    def setUp(self):
        self.user = User.objects.get(username='admin')
        self.client.login(username='admin', password='admin')
        self.headers = [(b'origin', b'...'), (b'cookie', self.client.cookies.output(header='', sep='; ').encode())]

    async def test_auth(self):
        # communicator = WebsocketCommunicator(AuthMiddlewareStack(GameRoomConsumer), 'ws/global/', self.user)
        communicator = WebsocketCommunicator(WsApp, '/ws/global/', self.headers)
        await communicator.connect()

        await communicator.send_json_to({'type': 'Hello', 'data': 'hi'})
        response = await communicator.receive_from()
        await communicator.disconnect()
