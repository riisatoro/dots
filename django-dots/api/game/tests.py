from django.test import TestCase

from random import randint, shuffle
from .core import Field, Core, EMPTY_LOOP, LOOP
from .structure import Point, GamePoint


class ApiFieldCreateFieldTest(TestCase):
    def test_normal(self):
        height, width = 5, 10
        game_field = Field.create_field(height, width)

        self.assertEqual(len(game_field.field), height+2)
        self.assertEqual(len(game_field.field[0]), width+2)

        field = game_field.field
        for i in range(1, height+1):
            for j in range(1, width+1):
                self.assertEqual(field[i][j].owner, None)
                self.assertEqual(field[i][j].captured, [])

    def test_borders(self):
        height, width = 5, 10
        game_field = Field.create_field(height, width)
        field = game_field.field

        for i in range(width+1):
            self.assertEqual(field[0][i].owner, -1)
            self.assertEqual(field[height+1][i].owner, -1)

        for i in range(height+1):
            self.assertEqual(field[i][0].owner, -1)
            self.assertEqual(field[i][width+1].owner, -1)

    def test_zero_size(self):
        try:
            _ = Field.create_field(0, 0)
        except Exception as e:
            self.assertEqual(type(e), ValueError)


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
        try:
            point = Point(20, -5)
            self.field = Field.change_owner(self.field, point, 2)
        except Exception as e:
            self.assertEqual(type(e), IndexError)

    def test_anonymous_owner(self):
        try:
            point = Point(1, 2)
            self.field = Field.change_owner(self.field, point, 50)
        except Exception as e:
            self.assertEqual(type(e), ValueError)


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
        self.field = Field.add_loop(self.field, self.loop_1)
        self.field = Field.add_loop(self.field, self.loop_2)

        loops = self.field.loops
        for key in loops.keys():
            self.assertIn(key, [1, 2])

    def test_add_empty_loop(self):
        self.field = Field.add_empty_loop(self.field, self.loop_1)
        self.field = Field.add_empty_loop(self.field, self.loop_2)

        loops = self.field.empty_loops
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
        try:
            Field.add_player_to_score(self.field, 270)
        except Exception as e:
            self.assertEqual(type(e), ValueError)


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
        self.assertEqual(
            Core.is_loop_already_found(self.field, self.loop),
            EMPTY_LOOP
        )

    def test_loop_in_loops(self):
        self.field.loops = self.loops
        shuffle(self.loop)
        self.assertEqual(
            Core.is_loop_already_found(self.field, self.loop),
            LOOP
        )


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

        self.field = Core.calc_score(self.field, self.captured_1, self.owner_1)

        score = self.field.score
        self.assertEqual(score[self.owner_1], 4)
        self.assertEqual(score[self.owner_3], 0)

    def test_descrease_score(self):
        for x, y in self.captured_1:
            self.field.field[x][y].owner = self.owner_3
        for x, y in self.captured_2:
            self.field.field[x][y].owner = self.owner_3

        self.field = Core.calc_score(self.field, self.captured_1, self.owner_1)
        for x, y in self.captured_1:
            self.field.field[x][y].captured = [self.owner_1]
        self.field = Core.calc_score(self.field, self.captured_2, self.owner_2)

        score = self.field.score
        self.assertEqual(score[self.owner_1], 1)
        self.assertEqual(score[self.owner_2], 4)
        self.assertEqual(score[self.owner_3], 0)


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
                if Point(i ,j) == self.point:
                    self.assertFalse(Core.is_neighbour(self.point, Point(i, j)))
                else:
                    self.assertTrue(Core.is_neighbour(self.point, Point(i, j)))

    def test_not_a_neighbour(self):
        for point in self.not_neighbours:
            self.assertFalse(Core.is_neighbour(self.point, point))


class ApiCoreFindLoops(TestCase):
    def setUp(self):
        self.no_loop = [
            Point(1, 2), Point(2, 3), Point(3, 3),
            Point(4, 2), Point(3, 1),
        ]

        self.loop = [
            Point(1, 2), Point(2, 3), Point(3, 3),
            Point(4, 2), Point(3, 1), Point(2, 1),
        ]

    def test_is_loop(self):
        loops = Core.find_loop_in_path(self.loop)
        self.assertTrue(loops)

    def test_is_not_a_loop(self):
        loops = Core.find_loop_in_path(self.not_loop)
        self.assertFalse(loops)

    def test_is_not_a_loop(self):
        loops = Core.find_loop_in_path([])
        self.assertFalse(loops)


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

        self.field.loops = {1: self.loop_1}

        loops = Core.find_all_new_loops(self.field, self.close_point_2, 1)
        self.assertEqual(len(loops), 1)
        self.assertEqual(set(loops[0]), set(self.loop_2))

    def test_eight_shape_loop(self):
        self.field = Field.create_field(20, 20)
        for x, y in self.points_3:
            self.field.field[x][y].owner = 1

        loops = Core.find_all_new_loops(self.field, self.close_point_3, 1)
        self.assertEqual(len(loops), 2)
        self.assertIn(len(loops[0]), [6, 4])
        self.assertIn(len(loops[1]), [6, 4])
