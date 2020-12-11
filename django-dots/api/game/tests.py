from django.test import TestCase
from django.test import Client


class TestPointTurn(TestCase):
    fixtures = ['dump.json']

    def setUp(self):
        self.client = Client()
        self.url = "/api/v2/setpoint/"
        self.content = "application/json"
        self.admin_headers = {"HTTP_AUTHORIZATION": "Token b32056cb5c7ab9cd5ca3852cc2e629c649ca400d"}
        self.user_headers = {"HTTP_AUTHORIZATION": "Token 5fc54899a7aaa7356f14f64c0152ace12f1fe184"}

    def test_turn_and_no_turn(self):
        response = self.client.post(self.url, {"point": [5, 8]}, self.content, **self.admin_headers)
        self.assertEqual(response.data["field"][5][8], "R")

        response = self.client.post(self.url, {"point": [5, 10]}, self.content, **self.admin_headers)

        self.assertTrue(response.data["error"])
        self.assertEqual(response.data["message"], "Now is not your turn.")

    def test_already_placed_point(self):
        response = self.client.post(self.url, {"point": [0, 1]}, self.content, **self.admin_headers)

        self.assertTrue(response.data["error"])
        self.assertEqual(response.data["message"], "This point is not available.")


class TestFieldCalc(TestCase):
    fixtures = ['dump.json']

    def setUp(self):
        self.client = Client()
        self.url = "/api/v2/setpoint/"
        self.content = "application/json"
        self.admin_headers = {"HTTP_AUTHORIZATION": "Token b32056cb5c7ab9cd5ca3852cc2e629c649ca400d"}
        self.user_headers = {"HTTP_AUTHORIZATION": "Token 5fc54899a7aaa7356f14f64c0152ace12f1fe184"}

    def test_surrounded(self):
        response = self.client.post(self.url, {"point": [1, 12]}, self.content, **self.admin_headers)
        self.assertEqual(response.data["field"][1][12], "Rl")

    def test_captured(self):
        response = self.client.post(self.url, {"point": [1, 2]}, self.content, **self.admin_headers)
        self.assertEqual(response.data["captured"], [0, 4])
