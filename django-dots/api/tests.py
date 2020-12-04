import json
from django.test import Client
from django.test import TestCase
from django.contrib.auth.models import User


class LoginTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = "/api/auth/login/"
        self.content = "application/json"

        self.user = User(username="admin")
        self.user.save()
        self.user.set_password("admin")
        self.user.save()

    def test_corret_login(self):
        response = self.client.post(self.url, {"username": "admin", "password": "admin"}, content_type=self.content)
        reply = json.loads(response.content.decode('utf8').replace("'", '"'))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(reply["error"])

    def test_wrong_username(self):
        response = self.client.post(self.url, {"username": "awdawdawd", "password": "admin"}, content_type=self.content)
        reply = json.loads(response.content.decode('utf8').replace("'", '"'))

        self.assertEqual(response.status_code, 401)
        self.assertContains("Invalid", reply["message"])

    def test_wrong_password(self):
        response = self.client.post(self.url, {"username": "awdawdawd", "password": "admin"}, content_type=self.content)
        reply = json.loads(response.content.decode('utf8').replace("'", '"'))

        self.assertEqual(response.status_code, 401)
        self.assertContains("Invalid", reply["message"])


class RegistrationTest(TestCase):
    def setUp(self):
        self.client = Client()

    def correct_registration(self):
        pass

    def registration_data_already_exists(self):
        pass

    def invalid_email(self):
        pass

    def different_passwords(self):
        pass

