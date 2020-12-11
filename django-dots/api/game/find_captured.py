
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
        print("in_neighbour", IndexError)
    return False


def find_loop(path):

    for q, _ in reversed(list(enumerate(path))):
        for p, _ in enumerate(path):
            if is_neighbour(path[p], path[q]):
                try:
                    return path[p:q+1]
                except IndexError:
                    print("IN find_loop", IndexError)
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


def process(field, colors):
    player_points = get_all_points(field, colors[0])
    enemy_points = get_all_points(field, colors[1])
    player_loops = []

    player_visited = [WHITE]*len(player_points)
    get_graph_loop(player_points, player_loops, player_visited)

    for loop in player_loops:
        if has_captured_point(loop, enemy_points):
            field = fill_circle_square(field, loop, colors[0])

    return field
