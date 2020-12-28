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


def build_solid_loops(loop):
    solid_loop = [min(loop)]
    sequence = [
        "UP",
        "UP_RIGHT",
        "RIGHT",
        "BOTTOM_RIGHT",
        "BOTTOM", 
        "BOTTOM_LEFT", 
        "LEFT", 
        "UP_LEFT", 
        ]
    index_sequence = 0

    for _ in range(len(loop)):
        if len(solid_loop) > 2 and is_neighbour(solid_loop[0], solid_loop[-1]):
            return solid_loop

        x, y = solid_loop[-1]

        for index in range(index_sequence, index_sequence+8):
            direction = sequence[index%len(sequence)]
            if direction == "UP_LEFT":
                if [x-1, y-1] in loop and [x-1, y-1] not in solid_loop:
                    solid_loop.append([x-1, y-1])
                    index_sequence = sequence.index("UP_LEFT")+4
                    break

            elif direction == "LEFT":
                if [x, y-1] in loop and [x, y-1] not in solid_loop:
                    solid_loop.append([x, y-1])
                    index_sequence = sequence.index("LEFT")+4
                    break

            elif direction == "BOTTOM_LEFT":
                if [x+1, y-1] in loop and [x+1, y-1] not in solid_loop:
                    solid_loop.append([x+1, y-1])
                    index_sequence = sequence.index("BOTTOM_LEFT")+4
                    break

            elif direction == "BOTTOM":
                if [x+1, y] in loop and [x+1, y] not in solid_loop:
                    solid_loop.append([x+1, y])
                    index_sequence = sequence.index("BOTTOM")+4
                    break

            elif direction == "BOTTOM_RIGHT":
                if [x+1, y+1] in loop and [x+1, y+1] not in solid_loop:
                    solid_loop.append([x+1, y+1])
                    index_sequence = sequence.index("BOTTOM_RIGHT")+4
                    break

            elif direction == "RIGHT":
                if [x, y+1] in loop and [x, y+1] not in solid_loop:
                    solid_loop.append([x, y+1])
                    index_sequence = sequence.index("RIGHT")+4
                    break

            elif direction == "UP_RIGHT":
                if [x-1, y+1] in loop and [x-1, y+1] not in solid_loop:
                    solid_loop.append([x-1, y+1])
                    index_sequence = sequence.index("UP_RIGHT")+4
                    break

            else:
                if [x-1, y] in loop and [x-1, y] not in solid_loop:
                    solid_loop.append([x-1, y])
                    index_sequence = sequence.index("UP")+4
                    break

    return solid_loop


def get_graph_loop(points, loops, visited):
    path = []

    def dfs(index):
        visited[index] = GRAY
        for j in range(0, len(visited)-1):
            if is_neighbour(points[index], points[j]):
                if visited[j] == WHITE:
                    x, y = points[j]
                    path.append((x, y))
                    dfs(j)
                    path.pop()
        
        if len(path) > 3:
            loops.append(path[:])

    for i in range(0, len(points)-1):
        if visited[i] == WHITE:
            x, y = points[i]
            path.append((x, y))
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
                    result = path[p:q+1]
                    if len(result) > 3:
                        return tuple(result)
                except IndexError:
                    result = path[p:q+1]
                    if len(result) > 3:
                        return tuple(result)
    return ()


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
    player_path = []
    player_loops = []
    loops = []

    player_visited = [WHITE]*len(player_points)
    get_graph_loop(player_points, player_path, player_visited)

    for loop in player_path:
        player_loops.append(find_loop(loop))

    player_loops = tuple(set(player_loops))

    for item in player_loops:
        print(item)

    return field, loops


if __name__ == '__main__':

    field = [
        ["E", "E", "R", "R", "E", "E", "E", "E",],
        ["E", "R", "G", "E", "R", "R", "R", "E",],
        ["E", "E", "R", "R", "G", "E", "E", "R",],
        ["E", "R", "E", "R", "E", "E", "R", "E",],
        ["E", "R", "G", "E", "R", "R", "E", "E",],
        ["E", "E", "R", "E", "R", "E", "E", "E",],
        ["E", "E", "E", "R", "E", "E", "E", "E",],
        ["E", "E", "E", "E", "E", "E", "E", "E",],
    ]

    field, loops = process(field, ["R", "G"])
