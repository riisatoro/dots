"""
Main logic of processing the game field, like, finding a loops and update captured points
    :return {
            "field": array of game point,
            "is_full": boolean; true if field has no empty points,
            }
"""

from . import find_captured as capture
from . import full_field as full
from .to_old import ConvertField


def process(field, point, user_color, colors):
    x, y = point[0]+1, point[1]+1
    changed = False
    if field[x-1][y-1] == "E":
        changed = True

    field = ConvertField.convert_to_new(field)
    field = capture.process((x, y), field, user_color, colors)

    loops = [
        {
            "color": colors[0],
            "playerLoop": []
        },
        {
            "color": colors[1],
            "playerLoop": []
        }
    ]

    field = ConvertField.convert_to_old(field)
    is_full = full.process(field)
    return {
        "field": field,
        "is_full": is_full,
        "changed": changed,
        "loops": loops
    }
