from collections import namedtuple
from dataclasses import dataclass, field

Point = namedtuple("Point", ["x", "y"])


@dataclass
class GamePoint:
    owner: int = None
    border: bool = False
    captured_by: list = field(default_factory=list)

    @property
    def is_captured(self):
        return bool(self.captured_by)


@dataclass
class GameField:
    field: [[GamePoint]]
    players: list = None
    loops: dict = None
    empty_loops: dict = None
    score: dict = None
    new_loops: list = field(default_factory=list)
    new_houses: list = field(default_factory=list)
