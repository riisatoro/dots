from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])

class GamePoint:
    def __init__(self, owner=None, captured=None):
        self.owner = None
        self.captured = []
        if captured:
            self.captured = captured

    def is_free(self):
        return not self.owner and not self.captured

    def __str__(self):
        return f"Owner: {self.owner}; captured by {self.captured}"


class GameField:
    def __init__(self, field: [[GamePoint]], players = None,  loops = None, empty_loops = None, score = None):
        self.players = players
        self.field = field
        self.loops = loops
        self.empty_loops = empty_loops
        self.score = score
