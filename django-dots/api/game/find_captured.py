
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


def has_captured_point(loop, enemy_points, any=False):
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


def has_any_point(loop, points):
    for point in points:
        if is_in_loop(loop, point):
            return True
    return False


def has_common(loop1, loop2):
    common = 0
    for point in loop1:
        if point in loop2:
            common += 1

        if common > 1:
            return True
    return False


def join_loop_points(loop1, loop2):
    for index in range(len(loop1)):
        if loop1[index] not in loop2:
            loop2.append(loop1[index])
        loop1[index] = []
    return


def drop_empty(loops):
    indexes = []
    for index, loop in enumerate(loops):
        if loop[0] == []:
            indexes.append(index-len(indexes))
    for index in indexes:
        loops.pop(index)


def build_solid_line(loop):
    solid_loop = []
    solid_loop.append(loop[0])
    for _ in range(1, len(loop)):
        for index in range(1, len(loop)):
            if loop[index] not in solid_loop:
                if is_neighbour(solid_loop[-1], loop[index]):
                    solid_loop.append(loop[index])
    # print("SOLID", solid_loop)
    return solid_loop


def drop_common_points(loop):
    indexes = []
    for index, point in enumerate(loop):
        if is_in_loop(loop, point):
            indexes.append(index-len(indexes))
    for index in indexes:
        loop.pop(index)

# OK
def join_loops(loops):
    if len(loops) < 2:
        return loops

    for i in range(len(loops)):
        for j in range(i+1, len(loops)):
            if has_common(loops[i], loops[j]):
                print("COMMON IN ", loops[i], loops[j])
                join_loop_points(loops[i], loops[j])

    drop_empty(loops)
    for index in range(len(loops)):
        drop_common_points(loops[index])
        loops[index] = build_solid_line(loops[index])
        #loops[index] = build_solid_line(loops[index])
        #loops[index] = build_solid_line(loops[index])
        print(loops[index])
    return loops


def has_no_points(field, loop):
    for i in range(len(field)):
        for j in range(len(field)):
            if [i, j] not in loop and is_in_loop(loop, [i, j]):
                # print("IN", loop, "EXISTED", [i, j])
                return False
    return True


def process(field, colors):
    print("PLAYER ", colors[0])
    player_points = get_all_points(field, colors[0])
    enemy_points = get_all_points(field, colors[1])
    player_loops = []
    loops = []
    frontend_loops = []

    player_visited = [WHITE]*len(player_points)
    get_graph_loop(player_points, player_loops, player_visited)
    
    for loop in player_loops:
        if len(loop) > 3 and  has_captured_point(loop, enemy_points):
            field = fill_circle_square(field, loop, colors[0])
            loops.append(loop)
        
        if len(loop) > 3 and not has_no_points(field, loop):
            frontend_loops.append(loop)
    
    frontend_loops = join_loops(frontend_loops)
    # print(frontend_loops)
    
    return field, frontend_loops
