import json

from django.test import Client, TestCase
from django.contrib.auth.models import User

from .game.calc_square import process as calc_score
from .game.find_captured import process as find_loops
from .game.find_captured import \
    get_graph_loop, is_neighbour, find_loop, has_captured_point, is_in_loop, has_no_points
from .game.main import process as calculate_field

# data2 - empty BLUE loops, one red loop between empty red loops
# data3 - empty red, one BLUE
# data4 - test rule exeption, RED should has one loop after placing point in (2, 6); RED turn
# data5 - two empty field for both players
# data6 - BLUE captured 12; RED captured 12
# data7 - loop in loop; BLUE captured 7


def print_ascii_field(field, colors):
    color_ascii = {
        "E": "●",
        colors[0]: "#",
        colors[1]: "&",

        "El": ".",
        colors[0]+"l": ".#.",
        colors[1]+"l": ".&.",
    }

    print("")
    for row in field:
        for point in row:
            print(color_ascii[point[0]], end=" ")
        print("")


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
        self.data = json.load(open("django-dots/api/fixtures/game_logic.json", 'r'))

    def get_data(self, number):
        data = self.data[f"data{number}"]
        return data["field"], data["colors"]

    def test_empty_field(self):
        # field has loops but none of them has captured points
        field, colors = self.get_data(5)
        _, loops = find_loops(field, colors)
        self.assertEqual(loops, [])

    def test_captured_field(self):
        # test if field changed and saved captured point
        field, colors = self.get_data(3)
        field, _ = find_loops(field, colors)
        self.assertEqual(field[1][1], "Rl")

    def test_empty_points(self):
        # test if field doesn't change empty points in loop without enemy points
        field, colors = self.get_data(3)
        field, _ = find_loops(field, colors)
        self.assertEqual(field[1][5], "E")
        self.assertEqual(field[2][5], "E")

    def test_captured_empty(self):
        # test if loop made empty points unavailable, when loop has enemy points
        field, colors = self.get_data(6)
        result = calculate_field(field, [0, 0], colors[0], colors)
        self.assertEqual(result["field"][7][8], "El")

    def test_correct_score(self):
        # test if field correctly calculated captured points
        field, colors = self.get_data(6)
        result = calculate_field(field, [0, 0], colors[0], colors)
        captured_1 = calc_score(result["field"], colors[0])
        captured_2 = calc_score(result["field"], colors[1])
        self.assertEqual(captured_1, 12)
        self.assertEqual(captured_2, 12)

    def test_score_loop_in_loop(self):
        # test if captured point in double loop are free
        # and check if score is calculated correctly
        field, colors = self.get_data(7)
        result = calculate_field(field, [0, 0], colors[0], colors)
        captured_1 = calc_score(result["field"], colors[1])  # R
        captured_2 = calc_score(result["field"], colors[0])  # B
        self.assertEqual(captured_1, 7)
        self.assertEqual(captured_2, 0)
        self.assertEqual(result["field"][4][4], colors[0])


class GameLoopsTest(TestCase):
    def setUp(self):
        self.data = json.load(open("django-dots/api/fixtures/game_logic.json", 'r'))

    def get_data(self, number):
        data = self.data[f"data{number}"]
        return data["field"], data["colors"]

    def test_has_one_minimal_loop(self):
        # field has one loop with captured point
        field, colors = self.get_data(3)
        loop = set([(0, 1), (1, 2), (2, 1), (1, 0)])
        _, loops = find_loops(field, colors[::-1])
        finded = set(tuple(loops[0]))
        self.assertTrue(loop == finded)

    def test_has_empty_loop(self):
        # field has one loop but without points
        field, colors = self.get_data(5)
        _, loops = find_loops(field, colors)
        self.assertEqual([], loops)

    def test_rule_exception(self):
        field, colors = self.get_data(4)
        data = calculate_field(field, [2, 6], colors[0], colors)
        loop = data["loops"]
        self.assertTrue(set(loop[0]) == set([(1, 5), (2, 6), (3, 5), (2, 4)]))
