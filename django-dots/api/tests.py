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


class GameLoopsTest(TestCase):
    def setUp(self):
        pass

    def test_has_ho_loops(self):
        # field without loops
        pass

    def test_has_one_minimal_loop(self):
        # field has one loop with captured point
        pass

    def test_has_empty_loop(self):
        # field has one loop but without points
        pass

    def test_both_players_has_loops(self):
        # test if both players has loops with captured points
        pass

    def test_two_loops_with_common(self):
        # if returns two loops but with common points
        # both has captured point
        # and no one big loop
        pass

    def test_two_common_empty_loops(self):
        # test two common loops but without captured point
        pass

    def test_five_common_loops(self):
        # test five common loops
        # 3 of them has captured point
        pass
