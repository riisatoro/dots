from .color_types import SYSTEM, EMPTY
from .point import Point

def get_new_field(row, col):
    if row == 0 or col == 0:
        row, col = 10, 10
    field = [[Point({"player_id": -1, "color": SYSTEM})]*(col+2)]
    for _ in range(row):
        tmp = [Point({"player_id": -1, "color": SYSTEM})]
        for _ in range(col):
            tmp.append(Point({"player_id": -1, "color": EMPTY}))
        tmp.append(Point({"player_id": -1, "color": SYSTEM}))
        field.append(tmp)
    field.append([Point({"player_id": -1, "color": SYSTEM})]*(col+2))
    return field
