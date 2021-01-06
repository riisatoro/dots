from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])

class GamePoint:
    def __init__(self, owner=None, captured=None):
        self.owner = None
        self.captured = []
        if captured:
            self.captured = captured

    def __str__(self):
        return f"Owner: {self.owner}; captured by {self.captured}"

class GameField:
    def __init__(self):
        pass