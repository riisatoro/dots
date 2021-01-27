import json
from itertools import cycle
from django.test import TestCase

from .core import Field, Core
from .structure import Point


def open_data(key):
    with open('django-dots/api/fixtures/field_and_points.json') as file:
        data = json.load(file)
        data = data[key]
    return data


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
        self.data = open_data('ApiCoreTestLoopsAreEqual')
        self.field = prepare_field(self.data)

    def test_loops_comparison(self):
        loop_1 = tuple_to_point(self.data['loop_1'])
        loop_2 = tuple_to_point(self.data['loop_2'])
        loop_3 = tuple_to_point(self.data['loop_3'])

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
                self.assertFalse(field[i][j].is_captured)

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


class TestIsNeigbors(TestCase):
    def setUp(self):
        self.data = open_data('TestIsNeigbors')

    def test_chain(self):
        self.assertTrue(
            Core.is_neighbours(self.data['loop'])
        )
        self.assertFalse(
            Core.is_neighbours(self.data['not_loop'])
        )


class TestFilterRandomLoops(TestCase):
    def setUp(self):
        self.data = open_data('TestFilterRandomLoops')
        self.field = prepare_field(self.data)

    def test_5_loops(self):
        points = self.data['points_1']
        for p in tuple_to_point(points):
            Core.process_point(self.field, p, 1)

        cycle_results = cycle([tuple_to_point(x)
                               for x in self.data['result_loops']])
        while len(next(cycle_results)) != len(self.field.new_houses[-1]['path']):
            pass

        results = list(zip(cycle_results, self.field.new_houses))
        for r in results:
            self.assertTrue(loops_are_equal(r[0], r[1]['path']))


class TestTwoPlayesCapture(TestCase):
    def setUp(self):
        self.data = open_data('TestTwoPlayesCapture')
        self.field = prepare_field(self.data)
        self.points_1 = tuple_to_point(self.data['points_1'])
        self.points_2 = tuple_to_point(self.data['points_2'])

    def test_two_rhombus(self):
        player_moves = list(zip(self.points_1, self.points_2))
        for point in player_moves:
            self.field = Core.process_point(self.field, point[0], 1)
            self.field = Core.process_point(self.field, point[1], 2)

        self.assertEqual(len(self.field.new_houses), 0)
        self.assertEqual(len(self.field.new_loops), 1)


class ApiFieldChangeOwnerTest(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)
        Field.add_player(self.field, 1)
        Field.add_player(self.field, 2)

    def test_normal(self):
        point = Point(1, 2)
        self.field = Field.change_owner(self.field, point, 1)
        self.assertEqual(self.field.field[point.y][point.x].owner, 1)

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


class ApiCoreFindCapturedPoints(TestCase):
    def setUp(self):
        self.data = open_data('ApiCoreFindCapturedPoints')
        self.field = prepare_field(self.data)

        self.points_1 = tuple_to_point(self.data["points_1"])
        self.points_2 = tuple_to_point(self.data["points_2"])
        self.points_3 = tuple_to_point(self.data["points_3"])

        for p in self.points_1:
            self.field = Core.process_point(self.field, p, 1)
        for p in self.points_2:
            self.field = Core.process_point(self.field, p, 2)
        for p in self.points_3:
            self.field = Core.process_point(self.field, p, 1)

    def test_captured(self):
        for p in self.points_1:
            self.assertEqual(
                len(self.field.field[p.y][p.x].captured_by), 2
            )
            self.assertEqual(
                self.field.field[p.y][p.x].owner, 1
            )

        for p in self.points_2:
            self.assertEqual(
                len(self.field.field[p.y][p.x].captured_by), 1
            )
            self.assertEqual(
                self.field.field[p.y][p.x].owner, 2
            )

        for p in self.points_3:
            self.assertEqual(
                len(self.field.field[p.y][p.x].captured_by), 0
            )
            self.assertEqual(
                self.field.field[p.y][p.x].owner, 1
            )

    def test_score(self):
        expected_score = self.data["result"]
        score = self.field.score

        for key, item in expected_score.items():
            self.assertEqual(item, score[int(key)])


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

        self.assertEqual(len(self.field.new_houses), 2)
        self.assertEqual(len(self.field.new_loops), 0)

        loop_1 = self.field.new_houses[0]['path']
        loop_2 = self.field.new_houses[1]['path']
        self.assertTrue(loop_1, self.result_loop_1)
        self.assertTrue(loop_2, self.result_loop_2)

    def test_eight_shape_loops(self):
        points = tuple_to_point(
            self.data["test_eight_shape_loops"]["points"]
        )
        for p in points:
            Core.process_point(self.field, p, 1)

        self.assertEqual(len(self.field.new_houses), 2)

        expected_1 = tuple_to_point(
            self.data["test_eight_shape_loops"]["result_1"]
        )
        expected_2 = tuple_to_point(
            self.data["test_eight_shape_loops"]["result_2"]
        )

        self.assertTrue(
            loops_are_equal(expected_1, self.field.new_houses[0]["path"])
        )
        self.assertTrue(
            loops_are_equal(expected_2, self.field.new_houses[1]["path"])
        )


class ApiCoreSetOfSides(TestCase):
    def setUp(self):
        self.field = Field.create_field(5, 5)
        self.field = Field.add_player(self.field, 1)
        self.points = [Point(2, 1), Point(3, 2), Point(3, 3)]

    def test_simple(self):
        for point in self.points:
            self.field.field[point.y][point.x].owner = 1

        sides = Core.get_all_segments(self.field.field, Point(3, 2), 1)
        self.assertEqual(len(sides), 2)

    def test_three(self):
        self.points.append(Point(4, 1))
        for point in self.points:
            self.field.field[point.y][point.x].owner = 1

        sides = Core.get_all_segments(self.field.field, Point(3, 2), 1)
        self.assertEqual(len(sides), 3)


class ApiCoreBuildLoops(TestCase):
    def setUp(self):
        self.field = Field.create_field(10, 10)
        self.field = Field.add_player(self.field, 1)
        self.points = tuple_to_point([
            [1, 1], [2, 1], [1, 2], [3, 2], [2, 3],
            [4, 3], [2, 4], [2, 5], [3, 6], [4, 5], [4, 4], [4, 3],
            [5, 4], [6, 4], [7, 5], [7, 6], [6, 7], [5, 7], [4, 7],
            [1, 6], [1, 7], [1, 8], [2, 9], [3, 10], [4, 10], [5, 9], [4, 8]
        ])

    def test_rhombus(self):
        for point in self.points:
            self.field.field[point.y][point.x].owner = 1

        loops = Core.build_loops(self.field.field, self.points[-1], 1)
        print(loops)
