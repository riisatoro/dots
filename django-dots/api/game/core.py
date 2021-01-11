from shapely.geometry import Point as shapePoint
from shapely.geometry import Polygon as shapePolygon
from .structure import Point, GamePoint, GameField

min_field_size = 5
EMPTY_LOOP = "EMPTY"
LOOP = "LOOP"

DFS_WHITE = "WHITE"
DFS_GRAY = "GRAY"
DFS_BLACK = "BLACK"

class Field:
    @staticmethod
    def create_field(height: int, width: int) -> GameField:
        if height < min_field_size or width < min_field_size:
            raise ValueError

        field = []
        for _ in range(height):
            tmp_row = []
            for _ in range(width):
                tmp_row.append(GamePoint())
            tmp_row.insert(0, GamePoint(owner=-1))
            tmp_row.append(GamePoint(owner=-1))
            field.append(tmp_row[:])

        border = [GamePoint(owner=-1)] * (width + 2)
        field.insert(0, border[:])
        field.append(border[:])

        game_field = GameField(field)
        return game_field

    @staticmethod
    def add_player(field: GameField, player: int) -> GameField:
        if field.players:
            if player not in field.players:
                field.players.append(player)
        else:
            field.players = [player]

        field = Field.add_player_to_score(field, player)
        return field

    @staticmethod
    def add_player_to_score(field: GameField, player: int):
        if not field.players or player not in field.players:
            raise ValueError

        if field.score:
            field.score[player] = 0
        else:
            field.score = {player: 0}
        return field

    @staticmethod
    def change_owner(field: GameField, point: Point, owner: int):
        x, y = point

        if x not in range(len(field.field)) or y not in range(len(field.field[0])):
            raise IndexError

        if owner not in field.players:
            raise ValueError

        if field.field[x][y].owner is None:
            field.field[x][y].owner = owner

        return field

    @staticmethod
    def is_full_field(field: GameField):
        for row in field.field:
            for point in row:
                if point.owner is None:
                    return False
        return True

    @staticmethod
    def add_loop(field: GameField, loop: [Point]):
        if not field.loops:
            loops = {1: loop}
        else:
            loops = field.loops
            loops[max(loops.keys())+1] = loop

        field.loops = loops
        return field

    @staticmethod
    def add_empty_loop(field: GameField, loop: [Point]):
        if not field.empty_loops:
            loops = {1: loop}
        else:
            loops = field.empty_loops
            loops[max(loops.keys())+1] = loop

        field.empty_loops = loops
        return field


class Core:
    @staticmethod
    def player_set_point(field: GameField, point: Point, owner: int):
        pass

    @staticmethod
    def is_neighbour(point_1, point_2):
        try:
            if point_1 == point_2:
                return False
            
            if abs(point_1[0] - point_2[0]) < 2:
                if abs(point_1[1] - point_2[1]) < 2:
                    if (abs(point_1[0] - point_2[0]) - abs(point_1[1] - point_2[1])) <= 2:
                        return True
        except IndexError:
            pass
        return False

    @staticmethod
    def find_all_loops_in_path(path):
        if len(path) < 3:
            return []
        
        loops = []
        for i in range(0, len(path)):
            for j in range(len(path)-1, -1, -1):
                if j-i < 3 and is_neighbour(path[i], path[j]):
                    pass

        return loops

    @staticmethod
    def dfs(field, point, path, visited, loops):
        visited[point] = DFS_GRAY

        x, y = point
        for i in range(point.x-1, point.x+2):
            for j in range(point.y-1, point.y+2):
                if field[i][j].owner != field[x][y].owner or Point(i, j) == point:
                    # if this point is not a player point
                    # and point is not equals last added to path point
                    return

                next_point = Point(i, j)
                if next_point in visited.keys():
                    if visited[next_point] == DFS_GRAY:
                        all_loops = Core.find_all_loops_in_path(path)
                        pass

                if next_point not in visited.keys():
                    pass

    @staticmethod
    def find_all_new_loops(field: GameField, point: Point, owner: int):
        game_field = field.field
        loops = field.loops
        empty_loops = field.empty_loops

        path = []
        visited = {}
        loops = []

        import ipdb; ipdb.set_trace()

        # visited[point] = DFS_WHITE
        path.append(point)
        Core.dfs(game_field, point, path, visited, loops)

        field.field = game_field
        field.loops = loops
        field.empty_loops = empty_loops
        return field

    @staticmethod
    def find_all_captured_points(field: GameField, loop: [Point], owner: int):
        owner_index = field.players.index(owner)
        enemies = field.players[:owner_index] + field.players[owner_index+1:]

        polygon = shapePolygon(loop)
        captured = []

        for x in range(1, len(field.field)-1):
            for y in range(1, len(field.field[0])-1):
                if field.field[x][y].owner in enemies or field.field[x][y].owner != owner:
                    if polygon.contains(shapePoint(x, y)):
                        captured.append(Point(x, y))
        return captured

    @staticmethod
    def is_point_in_empty_loop(field: GameField, point: Point):
        loop_id = False
        empty_loops = field.empty_loops

        if not empty_loops:
            return loop_id

        for key, loop in empty_loops.items():
            polygon = shapePolygon(loop)
            if polygon.contains(shapePoint(point)):
                if loop_id:
                    if len(loop) < len(empty_loops[loop_id]):
                        loop_id = key
                else:
                    loop_id = key
        return loop_id

    @staticmethod
    def calc_score(field: GameField, captured: [Point], owner: int):
        for x, y in captured:
            if field.field[x][y].owner is not None and field.field[x][y].owner != owner:
                captured_by = field.field[x][y].captured
                field.score[owner] += 1

                if captured_by:
                    field.score[captured_by[-1]] -= 1
        return field

    @staticmethod
    def set_captured_points(field: GameField, points: [Point], owner: int):
        for x, y in points:
            if field.field[x][y].captured:
                field.field[x][y].captured.append(owner)
            else:
                field.field[x][y].captured = [owner]
        return field

    @staticmethod
    def is_loop_already_found(field: GameField, loop: [Point]):
        loop_size = len(loop)
        loop_set = set(loop)

        loops = field.empty_loops
        if loops:
            for _, item in loops.items():
                if len(item) == loop_size:
                    if loop_set == set(item):
                        return EMPTY_LOOP

        loops = field.loops
        if loops:
            for _, item in loops.items():
                if len(item) == loop_size:
                    if loop_set == set(item):
                        return LOOP

        return False
