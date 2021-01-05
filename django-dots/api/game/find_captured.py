import json
from .color_types import EMPTY, SYSTEM, RED, BLUE, DFS_WHITE, DFS_GRAY, DFS_BLACK
from shapely.geometry import Point as geomPoint
from shapely.geometry.polygon import Polygon


def find_loop(path):
    for q, _ in enumerate(path[:][::-1]):
        for p, _ in enumerate(path):
            if is_neighbour(path[p], path[q]):
                if q+1-p > 3:
                    return path[p:q+1]
    return ()


def is_neighbour(point_1, point_2):
    try:
        if point_1 != point_2:
            if abs(point_1[0] - point_2[0]) < 2:
                if abs(point_1[1] - point_2[1]) < 2:
                    if (abs(point_1[0] - point_2[0]) - abs(point_1[1] - point_2[1])) <= 2:
                        return True
    except IndexError:
        pass
    return False


def is_in_loop(loop, point):
    x, y = point
    point = geomPoint(x, y)
    polygon = Polygon(loop)
    return polygon.contains(point)


def captured_enemy(field, loop, enemy_colors):
    for i, row in enumerate(field):
        for j, col in enumerate(row):
            if is_in_loop(loop, (i, j)):
                if col in enemy_colors and not col.captured:
                    return True
    return False


def calc_loops(point, field, enemy_colors):
    # depends from the point with player placed on the field    
    path = []
    visited = {}
    loops = []

    def dfs(coords:tuple):
        x, y = coords
        visited[coords] = DFS_GRAY

        for i in range(x-1, x+2):
            for j in range(y-1, y+2):
                dot = field[x][y]
                if (i, j) != (x, y) and not field[i][j].captured and field[i][j] == dot:
                    if (i, j) not in visited.keys() and is_neighbour(coords, (i, j)):
                        visited[(i, j)] = DFS_WHITE
                        path.append((i, j))

                        if len(path) > 3:
                            loop = find_loop(path)
                            if loop:
                                if captured_enemy(field, path, enemy_colors):
                                    if loops:
                                        if len(loops[0]) > len(path):
                                            loops[0] = path[:]
                                    else:
                                        loops.append(path[:])
                                
                                visited.pop((i, j))
                                path.pop()
                                return

                        dfs((i, j))
                        visited.pop((i, j))
                        path.pop()

    x, y = point
    visited[(x, y)] = DFS_WHITE
    path.append((x, y))
    dfs((x, y))
    path.pop()
    return loops


def find_loops_id(field):
    loops_ID = set()
    for row in field:
        for point in row:
            if point.part_of_loop:
                loops_ID.update(point.loop_id)
    return loops_ID


def set_point_as_loop(field, loop):
    new_loop_ID = 1
    loops_ID = find_loops_id(field)
    
    if loops_ID:
        new_loop_ID = max(loops_ID) + 1

    for point in loop[0]:
        x, y = point
        field[x][y].part_of_loop = True
        field[x][y].loop_id.append(new_loop_ID)

    return field


def set_captured_points(field, loop, color):
    # ! fix capturing own points
    for i, row in enumerate(field):
        for j, point in enumerate(row):
            if is_in_loop(loop, (i, j)):
                if point == color or point == EMPTY:
                    point.captured = True
                    point.part_of_loop = False
                    point.loop_id = []
                else:
                    point.captured = False
    return field


def is_surrounded(point, field, colors):
    x, y = point
    # go from point to the top
    # if enemy point then try to build a loop and capture this point
    # this function check any point, wich is not capured and not a part og the loop
    for color in colors:
        for i in range(x+1, len(field)):
            if field[i][y] == color:
                loop = calc_loops((i, y), field, field[x][y].color)
                if loop:
                    field = set_point_as_loop(field, loop)
                    field = set_captured_points(field, loop[0], field[x][y].color)
                
                    if field[x][y].captured:
                        return field

    return field


def process(point, field, player_color, colors):
    x, y = point
    if field[x][y].color["color"] == EMPTY and not field[x][y].captured:
        field[x][y].color = player_color
        enemy_index = (colors.index(player_color) + 1) % len(colors)
        loop = calc_loops(point, field, colors[enemy_index])

        if loop:
            field = set_point_as_loop(field, loop)
            field = set_captured_points(field, loop[0], colors[enemy_index])

        if field[x][y].is_free():
            other_colors = colors[:]
            other_colors.pop((enemy_index - 1) % len(colors) )
            field = is_surrounded((x, y), field, other_colors)

    return field

