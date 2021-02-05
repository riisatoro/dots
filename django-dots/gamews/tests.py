import json

from django.test import TestCase, Client
from asgiref.sync import sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.core.management import call_command
from unittest import IsolatedAsyncioTestCase

from dots.routing import application as WsApp
from .types import PLAYER_SET_DOT, PLAYER_JOIN_GAME, PLAYER_LEAVE

class WebsocketTestCase(IsolatedAsyncioTestCase):
    def setUp(self):
        self.client = Client()
        call_command('loaddata', 'dump.json', verbosity=0)

        self.user = User.objects.all().filter(username__in=['admin', 'helen'])
        self.client.login(username='admin', password='admin')
        self.client.login(username='helen', password='helen')
        self.headers = [(b'origin', b'...'), (b'cookie', self.client.cookies.output(header='', sep='; ').encode())]

    async def dest_simple(self):
        communicator = WebsocketCommunicator(WsApp, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_to(text_data=json.dumps({'type': 'Hello', 'data': 'hi'}))
        response = await communicator.receive_from()
        self.assertEqual(json.loads(response)['type'], 'INVALID_DATA')
        await communicator.disconnect()

    async def test_player_set_dot(self):

        communicator = WebsocketCommunicator(WsApp, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_json_to({'type': PLAYER_JOIN_GAME, 'currentGame': 1312})
        response = await communicator.receive_json_from()
        print(response)

        await communicator.disconnect()
