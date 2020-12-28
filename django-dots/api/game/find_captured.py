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


def get_graph_loop(player_loop, loops, visited):
    path = []

    def dfs(index):
        visited[index] = GRAY
        for j in range(len(visited)-1, 0, -1):
            if is_neighbour(player_loop[index], player_loop[j]):
                if visited[j] == WHITE:
                    path.append(player_loop[j])
                    dfs(j)
                    path.pop()

        if len(path) > 2:
            loop = find_loop(path)
            if loop:
                loops.append(loop)

    for i in range(0, len(player_loop)-1):
        if visited[i] == WHITE:
            path.append(player_loop[i])
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
    for point in enemy_points:
        if is_in_loop(loop, point):
            return True
    return False


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


def build_solid_loops(loop):
    solid_loop = [min(loop)]
    sequence = [
        "UP_LEFT",
        "LEFT",
        "BOTTOM_LEFT",
        "BOTTOM",
        "BOTTOM_RIGHT",
        "RIGHT",
        "UP_RIGHT",
        "UP"
    ]
    index_sequence = 0

    for _ in range(len(loop)):
        if len(solid_loop) > 2 and is_neighbour(solid_loop[0], solid_loop[-1]):
            return solid_loop

        x, y = solid_loop[-1]

        for index in range(index_sequence, index_sequence+8):
            direction = sequence[index % len(sequence)]
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
            loops.append(loop)

    clear_loops = []
    joined_array = []
    enemy_points = get_any_enemy_points(field, colors[1])

    for loop in player_loops:
        if len(loop) > 3 and has_captured_point(loop, enemy_points):
            clear_loops.append(loop)

    for _ in range(len(clear_loops)):
        if len(clear_loops) < 2:
            break

        max_index = find_max_loop(clear_loops)
        joined_array.append(clear_loops[max_index])
        clear_loops.pop(max_index)

        pop_indexes = []
        for index, loop in enumerate(clear_loops):
            if loop != [] and max_index != index and has_common_points(joined_array[-1], loop):
                pop_indexes.append(index - len(pop_indexes))
                joined_array = join_loops(joined_array, loop)

        for index in pop_indexes:
            clear_loops.pop(index)

    solid_loops = []
    for loop in joined_array:
        if len(loop) > 4:
            solid_loops.append(build_solid_loops(loop))
        else:
            solid_loops.append(loop)
    solid_loops = solid_loops + clear_loops

    return field, solid_loops
