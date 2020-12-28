from django.test import Client
from django.test import TestCase
from django.contrib.auth.models import User

from .test_data.data import empty_field, captured_field
from .game.find_captured import process


class LoginTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = "/api/auth/login/"
        self.content = "application/json"

        self.user = User(username="admin")
        self.user.set_password("admin")
        self.user.save()

    def test_corret_login(self):
        response = self.client.post(self.url, {"username": "admin", "password": "admin"}, content_type=self.content)
        self.assertEqual(response.status_code, 200)

    def test_wrong_username(self):
        response = self.client.post(self.url, {"username": "awdawdawd", "password": "admin"}, content_type=self.content)
        self.assertEqual(response.status_code, 401)

    def test_wrong_password(self):
        response = self.client.post(self.url, {"username": "admin", "password": "awdawdawd"}, content_type=self.content)
        self.assertEqual(response.status_code, 401)


class GameLogicTest(TestCase):
    def setUp(self):
        self.empty_field = empty_field
        self.captured_field = captured_field
        self.colors = ["R", "G"]

    def test_empty_field(self):
        _, loops = process(self.empty_field, self.colors)
        self.assertEqual(loops, [])

    def test_captured_field(self):
        field, loops = process(self.captured_field, self.colors)
        self.assertEqual(loops[0][0], [1, 2])
        self.assertEqual(loops[0][-1], [1, 3])
        self.assertEqual(field[4][1], "Gl")

    def test_empty_points(self):
        field, _ = process(self.empty_field, self.colors)
        self.assertEqual(field[1][6], "E")

    def test_captured_empty(self):
        field, _ = process(self.captured_field, self.colors)
        self.assertEqual(field[2][3], "El")
