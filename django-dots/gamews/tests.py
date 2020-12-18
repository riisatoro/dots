from django.test import TestCase, Client
from channels.testing import WebsocketCommunicator
from .consumers import GameRoomConsumer
from channels.routing import URLRouter
from django.urls import re_path


class TestConnection(TestCase):
    fixtures = ['dump.json']

    def setUp(self):
        self.client = Client()
        self.client.login(username="admin", password="admin")

    async def test_consumer_connection(self):
        application = URLRouter([re_path(r'ws/room/(?P<room_id>\w+)/test/(?P<test_id>\w+)/$', GameRoomConsumer.as_asgi())])

        communicator = WebsocketCommunicator(application, '/ws/room/250/test/258456/')
        subprotocol = await communicator.connect()
        print(subprotocol)
