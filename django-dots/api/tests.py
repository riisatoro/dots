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
        self.assertEqual(response.status_code, 200)

    def test_wrong_username(self):
        response = self.client.post(self.url, {"username": "awdawdawd", "password": "admin"}, content_type=self.content)
        self.assertEqual(response.status_code, 401)


    def test_wrong_password(self):
        response = self.client.post(self.url, {"username": "admin", "password": "awdawdawd"}, content_type=self.content)
        self.assertEqual(response.status_code, 401)


class GameRoom(TestCase):
    def setUp(self):
        self.client = Client()

    
    def test_autorized_get_room_list(self):
        pass
    
    def test_unauth_get_room_list(self):
        pass

    def test_auth_room_created(self):
        pass

    def test_unauth_room_created(self):
        pass

    def test_second_room_created(self):
        pass


'''

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


class SaveMatch():
    def setUp(self):
        self.client = Client()

    def correct_save(self):
        pass

    def unauthorized_create(self):
        pass

    def value_missed(self):
        pass

    def equal_score(self):
        pass


class GetMatch(TestCase):
    def setUp(self):
        pass

    def correct_request(self):
        pass

    def unauthorized_request(self):
        pass

'''