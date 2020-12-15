"""
Main logic of processing the game field, like, finding a loops and update captured points
    :return {
            "field": array of game point,
            "is_full": boolean; true if field has no empty points,
            "captured": array of amount of captured points
            }
"""

from . import find_captured as capture
from . import full_field as full
from . import calc_square as square


def process(field, point, user_color, colors):
    x, y = point
    if field[x][y] == "E":
        field[x][y] = user_color
        field = capture.process(field, colors)
        field = capture.process(field, colors[::-1])

    is_full = full.process(field)
    captured = square.process(field, colors)

    return {"field": field, "is_full": is_full, "captured": captured}
