"""
This is the class that represents a point in the game field
"""

class Point():
    """
    Point: represents a point in the game field
    """
    def __init__(self, owner, captured=None):
        self.owner = None
        self.captured = []
        if captured:
            self.captured = captured

    def is_free(self):
        """ Check if point is free - not captured and not in loop """
        return not self.captured and not self.owner

    def __str__(self):
        return f"{self.color}|loop: {self.part_of_loop}|captured: {self.captured}"
