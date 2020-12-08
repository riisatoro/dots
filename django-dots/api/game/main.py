""" Main logic of processing the game field, like, finding a loops and update captured points
    :return {
            "field": array of game point,
            "is_full": boolean; true if field has no empty points,
            "captured": array of amount of captured points
            }
"""

from find_captured import process as capture
from full_field import process as full
from calc_square import process as square


def process(field, colors):
    new_field = capture(field, colors)
    is_full = full(field)
    captured = square(field, colors)

    return {"field": new_field, "is_full": is_full, "captured": captured}

