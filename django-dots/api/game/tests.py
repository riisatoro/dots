from django.test import Client, TestCase

from .point import Point
from . import create
from .find_captured import find_loop, is_neighbour, is_in_loop, captured_enemy, calc_loops

class ApiCreateFieldTest(TestCase):
    def setUp(self):
        self.normal = [5, 5]
        self.zero = [5, 0]
        self.different = [10, 5]

    def test_square_size(self):
        field = create.get_new_field(self.normal[0], self.normal[1])
        self.assertEqual(len(field), self.normal[0]+2)
        self.assertEqual(len(field[0]), self.normal[1]+2)

    def test_zero_size(self):
        field = create.get_new_field(self.zero[0], self.zero[1])
        self.assertEqual(len(field), 12)
        self.assertEqual(len(field[0]), 12)

    def test_different_size(self):
        field = create.get_new_field(self.different[0], self.different[1])
        self.assertEqual(len(field), self.different[0]+2)
        self.assertEqual(len(field[0]), self.different[1]+2)


class ApiFindLoopTest(TestCase):
    def setUp(self):
        self.has_loop = [(-5, 2), (0, 1), (1, 1), (1, 2), (1, 3), (2, 3), (3, 3), (3, 2), (3, 1), (2, 1), (12, 8), (18, 24)]
        self.no_loop = [(1, 2), (1, 3), (2, 3), (3, 3)]
        self.empty_set = []
        self.neighbours = [(1, 2), (5, 6), (17, 12),  (20, 50), (20, 60), (27, 0), (9, 18)]

        self.result_1 = [(1, 1), (1, 2), (1, 3), (2, 3), (3, 3), (3, 2), (3, 1), (2, 1)]


    def test_has_loop(self):
        loop = find_loop(self.has_loop)
        self.assertEqual(loop, self.result_1)

    def test_no_loop(self):
        loop = find_loop(self.no_loop)
        self.assertEqual(loop, ())

    def test_empty_set(self):
        loop = find_loop(self.empty_set)
        self.assertEqual(loop, ())

    def test_neighbours(self):
        loop = find_loop(self.neighbours)
        self.assertEqual(loop, ())


class ApiNeighboursTest(TestCase):
    def setUp(self):
        self.same = [(5, 12), (5, 12)]
        self.in_line = [(10, 10), (10, 11)]
        self.in_diagonal = [(10, 10), (11, 11)]
        self.different = [(10, 10), (12, 10)]

    def test_same(self):
        p1, p2 = self.same
        self.assertFalse(is_neighbour(p1, p2))

    def test_in_line(self):
        p1, p2 = self.in_line
        self.assertTrue(is_neighbour(p1, p2))

    def test_in_diagonal(self):
        p1, p2 = self.in_diagonal
        self.assertTrue(is_neighbour(p1, p2))

    def test_different(self):
        p1, p2 = self.different
        self.assertFalse(is_neighbour(p1, p2))


class ApiInLoop(TestCase):
    def setUp(self):
        self.loop = [
            (2,0), (1,1), (0,2), (1,3), (1,4), (2,4), (3,5),
            (4,5), (5,4), (5,3), (6,2), (5,1), (4,0), (3,0)
        ]
        self.enemy_in = [(2,2), (2,3), (3,4)]
        self.enemy_out = [(12, 8), (0, 0)]
        self.point_is_loop = [(5, 4), (1, 3), (1, 4)]

        self.g_loop = [
            (1, 4), (0, 5), (0, 6), (1, 7), (2, 7), (3, 7),
            (4, 6), (5, 5), (5, 6), (5, 3), (5, 2), (5, 1),
            (4, 0), (3, 0), (2, 0), (1, 1), (1, 2), (2, 2),
            (3, 3), (3, 4), (2, 5),
        ]
        self.surrounded_out_of_loop = (2, 4)

    def test_enemy_in(self):
        for point in self.enemy_in:
            self.assertTrue(is_in_loop(self.loop, point))

    def test_enemy_out(self):
        for point in self.enemy_out:
            self.assertFalse(is_in_loop(self.loop, point))

    def test_point_is_loop(self):
        for point in self.point_is_loop:
            self.assertFalse(is_in_loop(self.loop, point))

    def test_surrounded_point_not_in_loop(self):
        self.assertFalse(is_in_loop(self.g_loop, self.surrounded_out_of_loop))
        self.assertTrue(is_in_loop(self.g_loop, (3, 1)))


class ApiCapturedEnemyTest(TestCase):
    def setUp(self):
        self.size = 6
        self.loop = [
            (2,0), (1,1), (0,2), (1,3), (1,4), (2,4), (3,5),
            (4,5), (5,4), (5,3), (6,2), (5,1), (4,0), (3,0)
        ]
        self.enemy_points = [(2,2), (2,3), (3,4)]
        self.color_1 = {"player_id": 2, "color": "RED"}
        self.color_2 = {"player_id": 4, "color": "BLUE"}
        self.color_3 = {"player_id": 8, "color": "GREEN"}

        self.field = create.get_new_field(self.size, self.size)
        for point in self.loop:
            x, y = point
            self.field[x+1][y+1] = Point(self.color_1)

    def test_has_no_points(self):
        result = captured_enemy(self.field, self.loop, [self.color_2, self.color_3])
        self.assertFalse(result)

    def test_has_enemies_points(self):
        self.field[2][2] = Point(self.color_3)
        self.field[3][3] = Point(self.color_2)
        result = captured_enemy(self.field, self.loop, [self.color_2, self.color_3])
        self.assertTrue(result)

    def test_out_of_loop(self):
        self.field[0][4] = Point(self.color_3)
        self.field[6][4] = Point(self.color_3)
        result = captured_enemy(self.field, self.loop, [self.color_2, self.color_3])
        self.assertFalse(result)

    def test_own_point_in_loop(self):
        self.field[3][3] = Point(self.color_1)
        result = captured_enemy(self.field, self.loop, [self.color_2, self.color_3])
        self.assertFalse(result)

class ApiFindLoopTest(TestCase):
    def setUp(self):
        self.loop_1 = [[2, 1], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3]]
        self.close_loop_1 = [3, 2]

        self.loop_color = {"player_id": 1, "color": "GREEN"}
        self.enemy_color = {"player_id": 6, "color": "BLACK"}
        self.field = create.get_new_field(5, 5)


    def fill_field(self, points, color):
        for point in points:
            x, y = point
            self.field[x+1][y+1] = Point(color)

    def test_field_without_loop(self):
        self.fill_field(self.loop_1, self.loop_color)
        loop = calc_loops([3, 3], self.field, [self.enemy_color])
        self.assertEqual(loop, [])

    def test_loop_without_point(self):
        self.fill_field(self.loop_1, self.loop_color)
        self.fill_field([self.close_loop_1], self.loop_color)
        loop = calc_loops(self.close_loop_1, self.field, [self.enemy_color])
        self.assertEqual(loop, [])

    def test_loop_with_point(self):
        self.fill_field(self.loop_1, self.loop_color)
        self.fill_field([[2, 2]], self.enemy_color)

        self.fill_field([self.close_loop_1], self.loop_color)

        loop = calc_loops(self.close_loop_1, self.field, [self.enemy_color])
        print(loop)
        #self.assertEqual(loop, [])
        


