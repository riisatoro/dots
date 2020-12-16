"""
Main logic of processing the game field, like, finding a loops and update captured points
    :return {
            "field": array of game point,
            "is_full": boolean; true if field has no empty points,
            }
"""

from . import find_captured as capture
from . import full_field as full


def process(field, point, user_color, colors):
    x, y = point
    changed = False
    if field[x][y] == "E":
        changed = True
        field[x][y] = user_color
        field = capture.process(field, colors)
        field = capture.process(field, colors[::-1])

    is_full = full.process(field)
    return {"field": field, "is_full": is_full, "changed": changed}
