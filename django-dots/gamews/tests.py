import json

from unittest import IsolatedAsyncioTestCase
from asyncio.exceptions import TimeoutError
from channels.testing import WebsocketCommunicator
from django.test import Client
from django.core.management import call_command

from dots.routing import application as ws_app
from .types import (
    INVALID_DATA,
    PLAYER_SET_DOT,
    PLAYER_JOIN_GAME,
    PLAYER_LEAVE,
)


class WebsocketTestCase(IsolatedAsyncioTestCase):
    def setUp(self):
        with open('django-dots/gamews/fixtures/send.json') as file:
            self.send_data = json.load(file)
        self.client = Client()
        call_command('loaddata', 'dump.json', verbosity=0)

        self.players = ['6', '1']
        self.client.login(username='admin', password='admin')
        self.client.login(username='helen', password='helen')
        self.headers = [(b'origin', b'...'), (b'cookie', self.client.cookies.output(header='', sep='; ').encode())]

    async def test_invalid_data(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()
        await communicator.send_json_to(
            self.send_data['invalid_request_data']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], INVALID_DATA)
        await communicator.disconnect()

    async def test_invalid_json(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()
        await communicator.send_json_to(
            self.send_data['invalid_json_data']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], INVALID_DATA)

    async def test_player_join(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()
        await communicator.send_json_to(
            self.send_data['valid_player_join']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], PLAYER_JOIN_GAME)
        response_data = json.loads(response['data'])['data']
        self.assertEqual(response_data['room'], 1312)

        field_data = json.loads(response['data'])['data']['field']
        for player in self.players:
            self.assertIn(player, field_data['players'].keys())
            self.assertIn(player, field_data['score'].keys())
            self.assertEqual(0, field_data['score'][player])
        await communicator.disconnect()

    async def test_player_invalid_join(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_json_to(
            self.send_data['invalid_player_join']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], INVALID_DATA)

    async def test_player_leave(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_json_to(
            self.send_data['player_leave']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], PLAYER_LEAVE)
        response_data = json.loads(response['data'])
        self.assertEqual(
            list(response_data['data'].values()), [1312]
        )

    async def test_player_invalid_leave(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_json_to(
            self.send_data['invalid_player_leave']
        )
        with self.assertRaises(TimeoutError):
            await communicator.receive_json_from(3)

    async def test_player_set_dot(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_json_to(
            self.send_data['player_set_dot']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], PLAYER_SET_DOT)
        response_data = json.loads(response['data'])['data']
        self.assertEqual(response_data['field']['field'][5][5]['owner'], 6)

    async def test_player_set_invalid_dot(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_json_to(
            self.send_data['player_set_invalid_dot']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], INVALID_DATA)

    async def player_set_dot_invalid_room(self):
        communicator = WebsocketCommunicator(ws_app, '/ws/global/', self.headers)
        connected, subprotocol = await communicator.connect()

        await communicator.send_json_to(
            self.send_data['player_set_dot_invalid_room']
        )
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], INVALID_DATA)
