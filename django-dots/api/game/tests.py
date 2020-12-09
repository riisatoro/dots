from django.test import TestCase
from django.test import Client
from .main import process

class TestRawGameLogic(TestCase):

    def setUp(self):
        self.loop_field = [
            ["E", "R", "R", "R", "R", "E", "E", "E", "E", "E", "E", "E", "G", "E", "E"],
            ["R", "E", "E", "E", "E", "R", "E", "E", "E", "E", "E", "G", "E", "G", "E"],
            ["R", "E", "E", "E", "E", "E", "R", "E", "E", "E", "E", "G", "E", "G", "E"],
            ["R", "E", "E", "R", "R", "E", "R", "E", "E", "E", "E", "G", "E", "G", "E"],
            ["R", "E", "R", "E", "E", "R", "R", "E", "E", "E", "E", "E", "G", "E", "E"],
            ["E", "R", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "R", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "G", "R", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["R", "G", "R", "Gl", "R", "G", "R", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "G", "R", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "R", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"]
        ]

        self.loop_in_loop = [
            ["E","E","R","E","E","E","E"],
            ["E","R","G","R","E","E","E"],
            ["R","G","E","G","E","E","E"],
            ["R","G","R","G","R","E","E"],
            ["R","G","E","G","R","E","E"],
            ["E","R","G","R","E","E","E"],
            ["E","E","R","E","E","E","E"],
        ]

        self.full_field = [["R"]*8]*8

        self.captured_field = [
            ["E", "R", "R", "R", "R", "E", "E", "E", "E", "E"],
            ["R", "E", "E", "E", "E", "R", "E", "E", "E", "E"],
            ["R", "Gl", "E", "E", "E", "E", "R", "E", "E", "E"],
            ["R", "E", "E", "R", "R", "E", "R", "E", "E", "E"],
            ["R", "E", "R", "E", "E", "R", "R", "E", "E", "E"],
            ["E", "R", "E", "Gl", "E", "R", "E", "E", "E", "E"],
            ["E", "E", "R", "R", "R", "E", "E", "G", "E", "E"],
            ["E", "E", "E", "E", "E", "E", "G", "Rl", "G", "E"],
            ["E", "E", "E", "E", "E", "E", "G", "Rl", "G", "E"],
            ["E", "E", "E", "E", "E", "E", "E", "G", "E", "E"]
        ]

        self.colors = ['R', 'G']

    def test_surrounded(self):
        self.loop_field[2][2] = "R"
        data = process(self.loop_field, self.colors)
        new_field = data["field"]

        self.assertEqual(new_field[2][2], 'R')
        self.assertEqual(new_field[11][3], 'Gl')

    def test_full_field(self):
        data = process(self.full_field, self.colors)
        is_full = data["is_full"]

        self.assertTrue(is_full)

    def test_captured(self):
        data = process(self.captured_field, self.colors)

        captured = data["captured"]
        self.assertEqual(captured, [2, 2])

    def test_loop_in_loop(self):
        data = process(self.loop_in_loop, ["R", "G"])
        data = process(data["field"], ["G", "R"])

        data["field"][2][4] = "R"
        data = process(data["field"], ["R", "G"])
        data = process(data["field"], ["G", "R"])

        self.assertEqual(data["field"][3][2], "R")


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

