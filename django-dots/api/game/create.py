from .color_types import SYSTEM, EMPTY
from .point import Point

def get_new_field(row, col):
    if row == 0 or col == 0:
        row, col = 10, 10
    field = [[Point(SYSTEM)]*(col+2)]
    for _ in range(row):
        tmp = [Point(SYSTEM)]
        for _ in range(col):
            tmp.append(Point(EMPTY))
        tmp.append(Point(SYSTEM))
        field.append(tmp)
    field.append([Point(SYSTEM)]*(col+2))
    return field
