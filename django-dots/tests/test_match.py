import json
from django.test import Client
from django.test import TestCase
from django.contrib.auth.models import User


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