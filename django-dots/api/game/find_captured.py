
WHITE = "white"
GRAY = "gray"
BLACK = "black"


def get_all_points(field, color):
    points = []
    for row in range(len(field)):
        for col in range(len(field[row])):
            if field[row][col] == color:
                points.append([row, color])
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

    for i in range(0, len(player_loop)-1):
        if visited[i] == WHITE:
            path.append(player_loop[i])
            dfs(i)
            path.pop()


def is_neighbour(point_1, point_2):
    try:
        if point_1 != point_2 \
            and abs(point_1[0] - point_2[0]) < 2 \
            and abs(point_1[1] - point_2[1]) < 2 \
            and (abs(point_1[0] - point_2[0]) - abs(point_1[1] - point_2[1])) <=2:
            return True
    except Exception as E:
        pass
    return False


def process(field, colors):
    player_points = get_all_points(field, colors[0])
    enemy_points = get_all_points(field, colors[1])
    player_loops = []


    player_visited = [WHITE]*len(player_points)
    get_graph_loop(player_points, player_loops, player_visited)

    for loop in player_loops:
        print('LOOP', loop)


    return field