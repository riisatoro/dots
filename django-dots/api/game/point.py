"""
This is the class that represents a point in the game field
"""

class Point():
    """
    Point: represents a point in the game field
    """
    def __init__(self, color, part_of_loop=False, captured=False, loop_id=None):
        self.color = color
        self.part_of_loop = part_of_loop
        self.captured = captured

        self.loop_id = []
        if loop_id:
            self.loop_id = loop_id

    def is_free(self):
        """
        Check if point is free - not captured and not in loop
        """
        return not self.captured and not self.part_of_loop

    def __str__(self):
        return f"{self.color}|loop: {self.part_of_loop}|captured: {self.captured}"

    def __eq__(self, color):
        return self.color == color

    def __ne__(self, color):
        return not self.color == color
