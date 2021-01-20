import json
from itertools import cycle
from django.test import TestCase

from random import randint, shuffle
from .core import Field, Core
from .structure import Point, GamePoint
from .draw import draw_field


def prepare_field(data):
    x, y = data["field"]
    field = Field.create_field(x, y)

    for player in data["players"]:
        field = Field.add_player(field, player)
    return field


def tuple_to_point(path):
    return [Point(x, y) for x, y in path]


def loops_are_equal(expected, actual):
    if len(expected) != len(actual):
        return False

    if set(expected) != set(actual):
        return False

    common_start = cycle(actual)
    while next(common_start) != expected[-1]:
        pass

    all_equal = all(
        point_1 == point_2
        for point_1, point_2 in zip(common_start, expected)
    )

    reversed_expected = list(reversed(expected))
    while next(common_start) != reversed_expected[-1]:
        pass

    reversed_all_equal = all(
        point_1 == point_2
        for point_1, point_2 in zip(common_start, reversed_expected)
    )

    return all_equal or reversed_all_equal


class ApiCoreTestLoopsAreEqual(TestCase):
    def setUp(self):
        with open('django-dots/api/fixtures/field_and_points.json') as file:
            self.data = json.load(file)
            self.data = self.data['ApiCoreTestLoopsAreEqual']

        self.field = prepare_field(self.data)

    def test_loops_comparison(self):
        loop_1 = tuple_to_point(self.data['loop_1'])
        loop_2 = tuple_to_point(self.data['loop_2'])
        loop_3 = tuple_to_point(self.data['loop_1'])

        self.assertFalse(loops_are_equal(loop_1, []))
        self.assertFalse(loops_are_equal(loop_1, [*loop_1, loop_1[0]]))
        self.assertFalse(loops_are_equal(loop_1, loop_3))

        self.assertTrue(loops_are_equal(loop_1, loop_1))
        self.assertTrue(loops_are_equal(loop_1, loop_2))
        self.assertTrue(loops_are_equal(loop_1, list(reversed(loop_1))))
        self.assertTrue(loops_are_equal(loop_1, list(reversed(loop_2))))

        self.assertFalse(loops_are_equal(loop_1, sorted(loop_1)))


class ApiFieldCreateFieldTest(TestCase):
    def test_normal(self):
        height, width = 5, 10
        game_field = Field.create_field(height, width)

        self.assertEqual(len(game_field.field), height+2)
        self.assertEqual(len(game_field.field[0]), width+2)

        field = game_field.field
        for i in range(1, height+1):
            for j in range(1, width+1):
                self.assertIsNone(field[i][j].owner)
                self.assertIsNone(field[i][j].captured)

    def test_borders(self):
        height, width = 5, 10
        game_field = Field.create_field(height, width)
        field = game_field.field

        for i in range(width+1):
            self.assertTrue(field[0][i].border)
            self.assertTrue(field[height+1][i].border)

        for i in range(height+1):
            self.assertTrue(field[i][0].border)
            self.assertTrue(field[i][width+1].border)

    def test_zero_size(self):
        with self.assertRaises(ValueError):
            Field.create_field(0, 0)


"""
class ApiFieldAddPlayerTest(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)

    def test_normal(self):
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 2)

        self.assertIn(1, self.field.players)
        self.assertIn(2, self.field.players)

    def test_duplicates(self):
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 1)
        self.assertEqual(self.field.players, [1])


class ApiFieldChangeOwnerTest(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)
        Field.add_player(self.field, 1)
        Field.add_player(self.field, 2)

    def test_normal(self):
        point = Point(1, 2)
        self.field = Field.change_owner(self.field, point, 1)
        self.assertEqual(self.field.field[1][2].owner, 1)

    def test_index_error(self):
        with self.assertRaises(IndexError):
            point = Point(20, -5)
            self.field = Field.change_owner(self.field, point, 2)

    def test_anonymous_owner(self):
        with self.assertRaises(ValueError):
            point = Point(1, 2)
            self.field = Field.change_owner(self.field, point, 50)


class ApiFieldFullFieldTest(TestCase):
    def setUp(self):
        self.empty = Field.create_field(5, 5)
        self.full = Field.create_field(5, 5)
        for i in range(len(self.full.field)):
            for j in range(len(self.full.field[0])):
                self.full.field[i][j].owner = 5

    def test_empty_field(self):
        self.assertFalse(Field.is_full_field(self.empty))

    def test_full_field(self):
        self.assertTrue(Field.is_full_field(self.full))


class ApiFieldAddLoopTest(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)
        self.loop_1 = [Point(1, 2), Point(2, 3), Point(5, 7)]
        self.loop_2 = [Point(4, 3), Point(2, 3), Point(5, 7)]

    def test_add_loop(self):
        self.field.loops = Field.add_loop(self.field.loops, self.loop_1)
        self.field.loops = Field.add_loop(self.field.loops, self.loop_2)

        loops = self.field.loops
        for key in loops.keys():
            self.assertIn(key, [1, 2])


class ApiFieldAddPlayerScore(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)

    def test_add_to_score(self):
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 7)
        self.assertIn(1, list(self.field.score.keys()))
        self.assertIn(7, self.field.score.keys())

    def test_add_just_to_score(self):
        with self.assertRaises(ValueError):
            Field.add_player_to_score(self.field, 270)


class ApiCoreCheckExistedLoopTest(TestCase):
    def setUp(self):
        self.loop = [Point(randint(0, 100), randint(0, 100))] * 200
        self.loops = {1: self.loop}

        self.field = Field.create_field(5, 5)

    def test_loop_is_new(self):
        self.assertFalse(Core.is_loop_already_found(self.field, self.loop))

    def test_loop_in_empty(self):
        self.field.empty_loops = self.loops
        shuffle(self.loop)
        self.assertTrue(Core.is_loop_already_found(self.field, self.loop))

    def test_loop_in_loops(self):
        self.field.loops = self.loops
        shuffle(self.loop)
        self.assertTrue(Core.is_loop_already_found(self.field, self.loop))


class ApiCorePointInEmptyLoop(TestCase):
    def setUp(self):
        self.field = Field.create_field(7, 7)
        self.loop_1 = {1: [Point(1, 2), Point(2, 3), Point(3, 2), Point(2, 1)]}
        self.in_loop_1 = Point(2, 2)
        self.out_of_loop = Point(4, 4)

        self.in_both_loops = Point(4, 4)
        self.in_big = Point(2, 4)
        self.loop_2 = {
            7: [Point(3, 4), Point(4, 5), Point(5, 4), Point(4, 3)],
            4: [
                Point(1, 3), Point(1, 4), Point(1, 5), Point(2, 6),
                Point(3, 7), Point(4, 7), Point(5, 7), Point(6, 6),
                Point(7, 5), Point(7, 4), Point(7, 3), Point(6, 2),
                Point(5, 1), Point(4, 1), Point(3, 1), Point(2, 2),
            ]
        }

    def test_no_empty_loop(self):
        self.assertFalse(
            Core.is_point_in_empty_loop(self.field, self.in_loop_1)
        )

    def test_in_empty(self):
        self.field.empty_loops = self.loop_1
        self.assertEqual(
            Core.is_point_in_empty_loop(self.field, self.in_loop_1),
            1
        )

    def test_out_of_loop(self):
        self.field.empty_loops = self.loop_1
        self.assertFalse(
            Core.is_point_in_empty_loop(self.field, self.out_of_loop)
        )

    def test_in_two_empty_loops(self):
        self.field.empty_loops = self.loop_2
        self.assertEqual(
            Core.is_point_in_empty_loop(self.field, self.in_both_loops),
            7
        )

    def test_in_one_big_loop(self):
        self.field.empty_loops = self.loop_2
        self.assertEqual(
            Core.is_point_in_empty_loop(self.field, self.in_big),
            4
        )


class ApiCoreFindCapturedPoints(TestCase):
    def setUp(self):
        self.field = Field.create_field(10, 10)
        Field.add_player(self.field, 10)

        self.loop = [
            Point(1, 3), Point(1, 4), Point(1, 5), Point(2, 6),
            Point(3, 7), Point(4, 7), Point(5, 7), Point(6, 6),
            Point(7, 5), Point(7, 4), Point(7, 3), Point(6, 2),
            Point(5, 1), Point(4, 1), Point(3, 1), Point(2, 2),
        ]

        self.enemy_points = [Point(3, 4), Point(4, 5), Point(5, 4), Point(4, 3)]

        self.not_loop = [Point(1, 1), Point(1, 2), Point(2, 2), Point(2, 1)]

    def test_three_points_in_loop(self):
        for player, point in enumerate(self.enemy_points):
            self.field = Field.add_player(self.field, player)
            self.field.field[point.x][point.y] = GamePoint(owner=player)

        captured = Core.find_all_captured_points(self.field, self.loop, 10)
        self.assertEqual(len(captured), 21)
        self.assertIn(Point(3, 2), captured)

    def test_no_points_in_loop(self):
        captured = Core.find_all_captured_points(self.field, self.not_loop, 10)
        self.assertEqual(len(captured), 0)


class ApiCoreSetCapturedPoints(TestCase):
    def setUp(self):
        self.field = Field.create_field(10, 10)

        self.owner_1 = 5
        self.owner_2 = 10
        self.field = Field.add_player(self.field, self.owner_1)
        self.field = Field.add_player(self.field, self.owner_2)

        self.captured = [Point(1, 3), Point(1, 4), Point(1, 5), Point(2, 6)]
        self.captured_2 = [Point(1, 3), Point(1, 4), Point(1, 5)]

    def test_normal(self):
        self.field = Core.set_captured_points(self.field, self.captured, self.owner_1)
        for x, y in self.captured:
            self.assertEqual(self.field.field[x][y].captured, [self.owner_1])

    def test_captured_twice(self):
        self.field = Core.set_captured_points(self.field, self.captured, self.owner_1)
        self.field = Core.set_captured_points(self.field, self.captured_2, self.owner_2)
        for x, y in self.captured_2:
            self.assertEqual(self.field.field[x][y].captured, [self.owner_1, self.owner_2])


class ApiCoreCalcScore(TestCase):
    def setUp(self):
        self.field = Field.create_field(10, 10)

        self.owner_1, self.owner_2, self.owner_3 = 1, 2, 3
        self.field = Field.add_player(self.field, self.owner_1)
        self.field = Field.add_player(self.field, self.owner_2)
        self.field = Field.add_player(self.field, self.owner_3)

        self.captured_1 = [
            Point(2, 1), Point(2, 2), Point(2, 3), Point(5, 5)
        ]
        self.captured_2 = [
            Point(2, 1), Point(2, 2), Point(2, 3), Point(8, 9),
        ]

    def test_increase_score(self):
        for x, y in self.captured_1:
            self.field.field[x][y].owner = self.owner_3

        self.field = Core.calc_score(self.field)

        score = self.field.score
        self.assertEqual(score[self.owner_1], 4)

    def test_descrease_score(self):
        for x, y in self.captured_1:
            self.field.field[x][y].owner = self.owner_3
        for x, y in self.captured_2:
            self.field.field[x][y].owner = self.owner_3

        self.field = Core.calc_score(self.field)
        for x, y in self.captured_1:
            self.field.field[x][y].captured = [self.owner_1]
        self.field = Core.calc_score(self.field)

        score = self.field.score
        self.assertEqual(score[self.owner_1], 1)
        self.assertEqual(score[self.owner_2], 4)


class ApiCoreIsNeighbours(TestCase):
    def setUp(self):
        self.point = Point(3, 3)
        self.not_neighbours = [
            Point(1, 1), Point(3, 5), Point(2, 1)
        ]

    def test_normal(self):
        x, y = self.point
        for i in range(x-1, x+2):
            for j in range(y-1, y+2):
                if Point(i, j) == self.point:
                    self.assertFalse(Core.is_neighbour(self.point, Point(i, j)))
                else:
                    self.assertTrue(Core.is_neighbour(self.point, Point(i, j)))

    def test_not_a_neighbour(self):
        for point in self.not_neighbours:
            self.assertFalse(Core.is_neighbour(self.point, point))


class ApiCoreFindAllNewLoops(TestCase):
    def setUp(self):
        self.field = Field.create_field(20, 20)
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 10)

        self.points_1 = [
            Point(1, 2), Point(2, 2), Point(3, 3), Point(4, 3),
            Point(5, 2), Point(4, 1), Point(3, 1)
        ]
        self.loop_1 = [
            Point(2, 2), Point(3, 3), Point(4, 3),
            Point(5, 2), Point(4, 1), Point(3, 1)
        ]
        self.close_point_1 = Point(3, 1)

        self.points_2 = [
            Point(2, 2), Point(3, 3), Point(4, 3), Point(2, 4),
            Point(5, 2), Point(4, 1), Point(3, 1), Point(1, 3),
        ]
        self.loop_2 = [
            Point(1, 3), Point(2, 4), Point(2, 2), Point(3, 3),
        ]
        self.close_point_2 = Point(2, 4)

        self.points_3 = [
            Point(1, 2), Point(1, 3), Point(1, 5),
            Point(2, 1), Point(2, 6),
            Point(3, 2), Point(3, 3), Point(3, 5),
        ]
        self.loop_3 = [
            [Point(1, 2), Point(1, 3), Point(2, 1), Point(3, 2), Point(3, 3)],
            [Point(1, 5), Point(2, 6), Point(3, 5)]
        ]
        self.close_point_3 = Point(2, 4)

    def test_one_loop(self):
        for x, y in self.points_1:
            self.field.field[x][y].owner = 1

        loops = Core.find_all_new_loops(self.field, self.close_point_1, 1)
        self.assertEqual(len(loops), 1)
        self.assertEqual(set(loops[0]), set(self.loop_1))

    def test_two_loop(self):
        for x, y in self.points_2:
            self.field.field[x][y].owner = 1

        self.field.empty_loops = {1: self.loop_1}

        loops = Core.find_all_new_loops(self.field, self.close_point_2, 1)
        self.assertEqual(len(loops), 1)
        self.assertEqual(set(loops[0]), set(self.loop_2))

    def test_eight_shape_loop(self):
        for x, y in self.points_3:
            self.field.field[x][y].owner = 1

        loops = Core.find_all_new_loops(self.field, self.close_point_3, 1)
        self.assertEqual(len(loops), 2)
        self.assertIn(len(loops[0]), [6, 4])
        self.assertIn(len(loops[1]), [6, 4])


class ApiCoreSortNewLoops(TestCase):
    def setUp(self):
        self.field = Field.create_field(20, 20)
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 2)

        self.loops_1 = [
            [Point(2, 2), Point(3, 3), Point(4, 3), Point(5, 2), Point(4, 1), Point(3, 1)],
            [Point(1, 3), Point(2, 4), Point(3, 3), Point(2, 2)]
        ]
        self.captured = [Point(3, 2), Point(4, 2)]

    def test_one_loop_captured(self):
        for loop in self.loops_1:
            for x, y in loop:
                self.field.field[x][y].owner = 1

        for x, y in self.captured:
            self.field.field[x][y].owner = 2

        field = Core.add_loops_and_capture_points(self.field, self.loops_1, 1)
        self.assertEqual(len(field.loops), 1)
        self.assertEqual(len(field.empty_loops), 1)
        self.assertEqual(set(field.loops[1]), set(self.loops_1[0]))
        self.assertEqual(set(field.empty_loops[1]), set(self.loops_1[1]))


class ApiCoreFindLoopPath(TestCase):
    def setUp(self):
        self.p1 = [
            Point(1, 2), Point(2, 1), Point(3, 2), Point(2, 3)
        ]
        self.p2 = [
            Point(4, 3), Point(5, 2), Point(6, 2), Point(7, 3), Point(6, 4), Point(5, 4), Point(6, 4), Point(7, 4)
        ]

    def test_normal(self):
        print(Core.find_loop_in_path(self.p1))
        print(Core.find_loop_in_path(self.p2))
              

class ApiCoreTestNewHomes(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 2)
        self.enemies = [
            Point(2, 2), 
        ]
        self.points = [
            Point(1, 1), Point(2, 1), Point(4, 1),
            Point(1, 2), Point(5, 2),
            Point(2, 3), Point(4, 3),
            Point(3, 2)
        ]

    def test_8_loop(self):
        for point in self.enemies:
            self.field = Core.process_point(self.field, point, 2)

        for point in self.points:
            self.field = Core.process_point(self.field, point, 1)

        self.assertEqual(len(self.field.new_loops), 1)
        self.assertEqual(len(self.field.new_houses), 1)
        self.assertEqual(len(self.field.new_loops[0]['path']), 4)


class ApiCoreTestNewLoops(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 2)
        self.enemies = [
            Point(2, 2), Point(4, 2)
        ]
        self.points = [
            Point(1, 1), Point(2, 1), Point(3, 1), Point(4, 1),
            Point(1, 2), Point(5, 2),
            Point(2, 3), Point(3, 3), Point(4, 3),
            Point(3, 2)
        ]

    def test_loop(self):
        for point in self.enemies:
            self.field = Core.process_point(self.field, point, 2)

        for point in self.points:
            self.field = Core.process_point(self.field, point, 1)


class ApiCoreTestStats(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)
        self.field = Field.add_player(self.field, 1)
        self.field = Field.add_player(self.field, 2)
        self.enemies = [
            Point(2, 2), 
        ]
        self.points = [
            Point(1, 1), Point(2, 1), Point(4, 1),
            Point(1, 2), Point(5, 2),
            Point(2, 3), Point(4, 3),
            Point(3, 2)
        ]

    def test_stats(self):
        for point in self.enemies:
            self.field = Core.process_point(self.field, point, 2)

        for point in self.points:
            self.field = Core.process_point(self.field, point, 1)
        
        stats = Core.prepare_loop_stats(self.field, [Point(2, 1), Point(3, 2)])

        stats = Core.prepare_loop_stats(self.field.field, self.field.new_houses[0]['path'], 1)
        self.assertEqual(stats['empty'], [Point(4, 2)])
        self.assertEqual(stats['enemy'], [])

        stats = Core.prepare_loop_stats(self.field.field, self.field.new_loops[0]['path'], 1)
        self.assertEqual(stats['empty'], [])
        self.assertEqual(stats['enemy'], [])
        self.assertEqual(stats['captured'], [Point(2, 2)])

"""


class ApiCoreBuildAllLoops(TestCase):
    def setUp(self):
        with open('django-dots/api/fixtures/field_and_points.json') as file:
            self.data = json.load(file)
            self.data = self.data['ApiCoreBuildAllLoops']

        self.field = prepare_field(self.data)

        self.points_2 = [
            Point(2, 4), Point(3, 5), Point(4, 5), Point(
                5, 4), Point(5, 3), Point(4, 2)
        ]
        self.points_3 = [Point(5, 1), Point(6, 2)]

        self.points_4 = [
            Point(2, 1), Point(1, 2), Point(3, 2), Point(
                4, 1), Point(5, 2), Point(4, 3), Point(2, 3)
        ]

        self.result_loop_1 = [
            Point(2, 3), Point(3, 2),  Point(2, 1), Point(1, 2)
        ]
        self.result_loop_2 = [
            Point(4, 2), Point(5, 3), Point(5, 4), Point(4, 5), Point(
                3, 5), Point(2, 4), Point(2, 3), Point(3, 2)
        ]

        self.result_loop_4_1 = [
            Point(x=4, y=3), Point(x=5, y=2), Point(x=4, y=1), Point(x=3, y=2)
        ]

        self.result_loop_4_2 = [
            Point(x=2, y=3), Point(x=1, y=2), Point(x=2, y=1), Point(x=3, y=2)
        ]

    def test_simple(self):
        data = self.data["test_simple"]
        for p in tuple_to_point(data['points']):
            self.field = Core.process_point(self.field, p, 1)
        #import bpdb; bpdb.set_trace()
        pass

    def test_rombus(self):
        for p in tuple_to_point(self.data['points_1']):
            Core.process_point(self.field, p, 1)

        self.assertEqual(len(self.field.new_houses), 1)
        self.assertEqual(len(self.field.new_loops), 0)

        loop = self.field.new_houses[0]['path']
        self.assertTrue(loops_are_equal(loop, self.result_loop_1))

    def test_two_loops(self):
        for p in tuple_to_point(self.data['points_1']):
            Core.process_point(self.field, p, 1)
        for p in self.points_2:
            Core.process_point(self.field, p, 1)

        draw_field(self.field)
        self.assertEqual(len(self.field.new_houses), 2)
        self.assertEqual(len(self.field.new_loops), 0)

        loop_1 = self.field.new_houses[0]['path']
        loop_2 = self.field.new_houses[1]['path']
        self.assertTrue(loop_1, self.result_loop_1)
        self.assertTrue(loop_2, self.result_loop_2)

    def test_eight_shape_loops(self):
        for p in self.points_4:
            Core.process_point(self.field, p, 1)

        self.assertEqual(len(self.field.new_houses), 2)

        c = cycle(self.result_loop_4_1)
        r = zip(c, self.field.new_houses[0]['path'])
        for p in r:
            self.assertEqual(p[0], p[1])

        c = cycle(self.result_loop_4_2)
        r = zip(c, self.field.new_houses[1]['path'])
        for p in r:
            self.assertEqual(p[0], p[1])


class TestIsNeigbors(TestCase):
    def setUp(self):
        self.loop = [
            Point(1, 1), Point(2, 2), Point(2, 3), Point(3, 4), Point(
                3, 3), Point(3, 2), Point(3, 1), Point(2, 1)
        ]

        self.not_a_loop = [
            Point(1, 1), Point(2, 5), Point(3, 2), Point(3, 1), Point(5, 1)
        ]

    def test_chain(self):
        self.assertTrue(Core.is_neighbours(self.loop))
        self.assertFalse(Core.is_neighbours(self.not_a_loop))


class TestFreezing(TestCase):
    def setUp(self):
        with open('django-dots/api/fixtures/field_and_points.json') as file:
            self.data = json.load(file)
            self.data = self.data['TestFreezing']
        self.field = prepare_field(self.data)

    def test_freeze(self):
        for _ in range(15 * 15):
            self.field.field[randint(1, 30)][randint(1, 30)].owner = 1

        random_points = [Point(randint(1, 30), randint(1, 30))
                         for _ in range(30)]
        for p in random_points:
            self.field = Core.process_point(self.field, p, 1)

    def fill_all(self):
        self.field = Field.create_field(5, 5)
        for y, row in enumerate(self.field.field):
            for x, point in enumerate(row):
                if not point.border and y < 4:
                    point.owner = 1
        print(len(Core.build_all_loops(self.field.field, Point(1, 1), 1)))


class TestFilterRandomLoops(TestCase):
    def setUp(self):
        with open('django-dots/api/fixtures/field_and_points.json') as file:
            self.data = json.load(file)
            self.data = self.data['TestFilterRandomLoops']
        self.field = prepare_field(self.data)

    def test_5_loops(self):
        points = self.data['points_1']
        for p in tuple_to_point(points):
            Core.process_point(self.field, p, 1)

        cycle_results = cycle([tuple_to_point(x) for x in self.data['result_loops']])
        while len(next(cycle_results)) != len(self.field.new_houses[-1]['path']):
            pass

        results = list(zip(cycle_results, self.field.new_houses))
        for r in results:
            self.assertTrue(loops_are_equal(r[0], r[1]['path']))

class TestTwoPlayesCapture(TestCase):
    def setUp(self):
        with open('django-dots/api/fixtures/field_and_points.json') as file:
            self.data = json.load(file)
            self.data = self.data['TestTwoPlayesCapture']
        self.field = prepare_field(self.data)
        self.points_1 = tuple_to_point(self.data['points_1'])
        self.points_2 = tuple_to_point(self.data['points_2'])

    def test_two_rhombus(self):
        player_moves = list(zip(self.points_1, self.points_2))
        for point in player_moves:
            self.field = Core.process_point(self.field, point[0], 1)
            self.field = Core.process_point(self.field, point[1], 2)

        import bpdb; bpdb.set_trace()