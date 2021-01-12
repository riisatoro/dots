from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])


class GamePoint:
    def __init__(self, owner=None, border=False, captured=None, loops=None):
        self.owner = owner
        self.captured = []
        self.loops = []
        self.border = border

        if captured:
            self.captured = captured
        if loops:
            self.loops = loops

    def __str__(self):
        return f"Owner: {self.owner}; captured by {self.captured}"


class GameField:
    def __init__(self, field: [[GamePoint]], **kwargs):
        self.field = field
        self.players = kwargs.get("players")
        self.field = kwargs.get("field")
        self.loops = kwargs.get("loops")
        self.empty_loops = kwargs.get("empty_loops")
        self.score = kwargs.get("score")
