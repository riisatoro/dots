import collections

WHITE = "white"
GRAY = "gray"
BLACK = "black"


def get_all_points(field, color):
    points = []
    for i, _ in enumerate(field):
        for j, _ in enumerate(field[i]):
            if field[i][j] == color:
                points.append([i, j])
    return points


def build_solid_loops(loop):
    sequence = {
        "UP_LEFT": [-1, -1],
        "LEFT": [0, -1], 
        "BOTTOM_LEFT": [1, -1], 
        "BOTTOM": [1, 0], 
        "BOTTOM_RIGHT": [1, 1],
        "RIGHT": [0, 1],
        "UP_RIGHT": [-1, 1],
        "UP": [-1, 0],
    }
    return []


def get_graph_loop(points, loops, visited):
    path = []

    def dfs(index):
        visited[index] = GRAY
        for j in range(0, len(visited)-1):
            if is_neighbour(points[index], points[j]):
                if visited[j] == WHITE:
                    path.append(points[j])
                    dfs(j)
                    path.pop()

        if len(path) > 3:
            loop = find_loop(path)
            if loop:
                loops.append(loop)

    for i in range(0, len(points)-1):
        if visited[i] == WHITE:
            path.append(points[i])
            dfs(i)
            path.pop()


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


def find_loop(path):
    for q, _ in reversed(list(enumerate(path))):
        for p, _ in enumerate(path):
            if is_neighbour(path[p], path[q]):
                try:
                    return path[p:q+1]
                except IndexError:
                    return path[p:q]
    return []


def has_captured_point(loop, enemy_points):
    has_captured = False
    for point in enemy_points:
        if is_in_loop(loop, point):
            enemy_points.pop(enemy_points.index(point))
            has_captured = True
    return has_captured


def is_in_loop(loop, point):
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


def fill_circle_square(field, loop, player):
    for i, _ in enumerate(field):
        for j, _ in enumerate(field):
            if is_in_loop(loop, [i, j]):
                if field[i][j][-1] != "l":
                    if field[i][j] != player:
                        field[i][j] = field[i][j]+"l"
                else:
                    if field[i][j][0] == player:
                        field[i][j] = player
    return field


def has_no_points(field, loop):
    for i in range(len(field)):
        for j in range(len(field)):
            if [i, j] not in loop and is_in_loop(loop, [i, j]):
                return False
    return True


def find_max_loop(array):
    length = 0
    max_index = 0
    for index, loop in enumerate(array):
        if len(loop) > length:
            length = len(loop)
            max_index = index
    return max_index


def has_common_points(parent_loop, child_loop):
    count = 0
    for point in child_loop:
        if point in parent_loop:
            count += 1

        if count > 1:
            return True
    return False


def join_loops(loops, loop):
    for point in loop:
        if point not in loops[-1]:
            loops[-1].append(point)

    return loops


def get_any_enemy_points(field, color):
    points = []
    for i, _ in enumerate(field):
        for j, _ in enumerate(field[i]):
            if field[i][j] == color or field[i][j] == color+"l":
                points.append([i, j])
    return points


def process(field, colors):
    player_points = get_all_points(field, colors[0])
    enemy_points = get_all_points(field, colors[1])
    player_loops = []
    loops = []

    player_visited = [WHITE]*len(player_points)
    get_graph_loop(player_points, player_loops, player_visited)

    for loop in player_loops:
        if len(loop) > 3 and has_captured_point(loop, enemy_points):
            field = fill_circle_square(field, loop, colors[0])

    enemy_points = get_any_enemy_points(field, colors[1])
    for loop in player_loops:
        if len(loop) > 3 and has_captured_point(loop, enemy_points):
            loops.append(loop)

    return field, loops
                

if __name__ == '__main__':

    field = [
        ["E", "E", "E", "E", "E", "E", "E",],
        ["E", "R", "E", "R", "R", "R", "E",],
        ["R", "G", "R", "E", "G", "R", "E",],
        ["E", "R", "E", "R", "R", "R", "E",],
        ["E", "R", "E", "R", "R", "E", "R",],
        ["E", "R", "R", "R", "G", "G", "R",],
        ["E", "E", "E", "E", "R", "R", "E",],
    ]

    field, loop = process(field, ["R", "G"])
    all_enemy_points = get_any_enemy_points(field, 'G')

    for item in loop:
        print(item)
