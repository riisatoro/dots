import unittest
from main import process

class TestStringMethods(unittest.TestCase):

    def setUp(self):
        self.loop_field = [
            ["E", "R", "R", "R", "R", "E", "E", "E", "E", "E", "E", "E", "G", "E", "E"],
            ["R", "E", "E", "E", "E", "R", "E", "E", "E", "E", "E", "G", "E", "G", "E"],
            ["R", "E", "E", "E", "E", "E", "R", "E", "E", "E", "E", "G", "E", "G", "E"],
            ["R", "E", "E", "R", "R", "E", "R", "E", "E", "E", "E", "G", "E", "G", "E"],
            ["R", "E", "R", "E", "E", "R", "R", "E", "E", "E", "E", "E", "G", "E", "E"],
            ["E", "R", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "R", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "G", "R", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["R", "G", "R", "Gl", "R", "G", "R", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "G", "R", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "G", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
            ["E", "E", "E", "R", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E"]
        ]

        self.loop_in_loop = [
            ["E","E","E","E","E","E"],
            ["E","E","G","E","E","E"],
            ["E","G","R","G","E","E"],
            ["E","G","E","G","E","E"],
            ["E","E","G","E","E","E"],
            ["E","E","E","E","E","E"],
        ]

        self.full_field = [["R"]*8]*8

        self.captured_field = [
            ["E", "R", "R", "R", "R", "E", "E", "E", "E", "E"],
            ["R", "E", "E", "E", "E", "R", "E", "E", "E", "E"],
            ["R", "Gl", "E", "E", "E", "E", "R", "E", "E", "E"],
            ["R", "E", "E", "R", "R", "E", "R", "E", "E", "E"],
            ["R", "E", "R", "E", "E", "R", "R", "E", "E", "E"],
            ["E", "R", "E", "Gl", "E", "R", "E", "E", "E", "E"],
            ["E", "E", "R", "R", "R", "E", "E", "G", "E", "E"],
            ["E", "E", "E", "E", "E", "E", "G", "Rl", "G", "E"],
            ["E", "E", "E", "E", "E", "E", "G", "Rl", "G", "E"],
            ["E", "E", "E", "E", "E", "E", "E", "G", "E", "E"]
        ]

        self.colors = ['R', 'G']

    def test_surrounded(self):
        self.loop_field[2][2] = "R"
        data = process(self.loop_field, self.colors)
        new_field = data["field"]

        self.assertEqual(new_field[2][2], 'R')
        self.assertEqual(new_field[11][3], 'Gl')

    def test_released(self):
        data = process(self.loop_in_loop, self.colors[::-1])
        new_field = data["field"]

        self.assertEqual(new_field[2][2], 'Rl')

    def test_full_field(self):
        data = process(self.full_field, self.colors)
        is_full = data["is_full"]

        self.assertTrue(is_full)

    def test_captured(self):
        data = process(self.captured_field, self.colors)

        captured = data["captured"]
        self.assertEqual(captured, [2, 2])


if __name__ == '__main__':
    unittest.main()