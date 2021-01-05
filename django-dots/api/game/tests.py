from django.test import Client, TestCase

from . import point
from . import create
from .find_captured import find_loop, is_neighbour, is_in_loop, captured_enemy

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

        self.field = create.get_new_field(self.size, self.size)
