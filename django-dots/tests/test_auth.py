import json
from django.test import Client
from django.test import TestCase
from django.contrib.auth.models import User


class LoginTest(TestCase):
    def setUp(self):
        self.client = Client()
        
        self.user = User(username="admin")
        self.user.save()
        self.user.set_password("admin")
        self.user.save()

    def corret_login(self):
        response = self.client.post("/api/auth/login/", {"username": "admin", "password": "admin"}, content_type="application/json")
        reply = json.loads(response.content.decode('utf8').replace("'", '"'))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(reply["error"])

    def wrong_username(self):
        pass

    def wrong_password(self):
        pass


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

