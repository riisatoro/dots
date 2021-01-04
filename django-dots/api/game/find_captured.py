import json
from .color_types import EMPTY, SYSTEM, RED, BLUE, DFS_WHITE, DFS_GRAY, DFS_BLACK
from .to_old import ConvertField


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


def is_in_loop(loop, point:tuple):
    x, y = point
    left, right, top, bottom = 0, 0, 0, 0

    for item in loop:
        if item[0] == x and item[1] < y and left == 0:
            left += 1
        elif item[0] == x and item[1] > y and right == 0:
            right += 1
        elif item[1] == y and item[0] < x and top == 0:
            top += 1
        elif item[1] == y and item[0] > x and bottom == 0:
            bottom += 1

    if left+right+top+bottom == 4:
        return True
    return False


def captured_enemy(field, loop, enemy_color):
    for i, row in enumerate(field):
        for j, col in enumerate(row):
            if not col.captured and is_in_loop(loop, (i, j)):
                if col == enemy_color:
                    return True
    return False


def calc_loops(point, field, enemy_color):
    # depends from the point with player placed on the field    
    path = []
    visited = {}
    loops = []

    def dfs(coords:tuple):
        x, y = coords
        visited[coords] = DFS_GRAY
        
        # find all neighbours for this point
        # TODO check first 4 sides, then 4 diagonals
        for i in range(x-1, x+2):
            for j in range(y-1, y+2):
                dot = field[x][y]  # Point obj
                if (i, j) != (x, y) and not field[i][j].captured and field[i][j] == dot:
                    if (i, j) not in visited.keys() and is_neighbour(coords, (i, j)):
                        visited[(i, j)] = DFS_WHITE
                        path.append((i, j))

                        if len(path) > 3:
                            loop = find_loop(path)
                            if loop:
                                # write all new loops into a set
                                # check existed loops is a subset of this loop
                                # if True, break this reccursion
                                if captured_enemy(field, path, enemy_color):
                                    # find min loops
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
    # save new loop in in [0][0] system point
    # then just increment and use it
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
    """
    Go from point to the top
    If enemy point, then try to build a loop and capture this point
    This function check any point, wich is not capured and not a part og the loop
    """
    x, y = point
    
    for color in colors:
        for i in range(x+1, len(field)-1):
            if field[i][y] == color:
                loop = calc_loops((i, y), field, field[x][y].color)
                if loop:
                    field = set_point_as_loop(field, loop)
                    field = set_captured_points(field, loop[0], field[x][y].color)
                
                    if field[x][y].captured:
                        return field

    return field


def process(point, field, player_color, colors):
    field = ConvertField.convert_to_new(field)
    x, y = point
    if field[x][y].color == EMPTY and not field[x][y].captured:
        field[x][y].color = player_color
        enemy_index = (colors.index(player_color) + 1) % len(colors)
        # here is a speed trouble up to 3.5 seconds
        loop = calc_loops(point, field, colors[enemy_index])
        # create a loop and update points that create this loop
        if loop:
            field = set_point_as_loop(field, loop)
            # set captured points of the enemy
            field = set_captured_points(field, loop[0], colors[enemy_index])

        if field[x][y].is_free():
            other_colors = colors[:]
            other_colors.pop((enemy_index - 1) % len(colors) )
            # set potential loops with minimum of 1 points in it
            # then just check if point in one from potential loops
            # in this case we drop the continious searching for the loops
            field = is_surrounded((x, y), field, other_colors)

    field = ConvertField.convert_to_old(field)
    return field

