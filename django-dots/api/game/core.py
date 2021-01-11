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
            return False
        return False

    @staticmethod
    def find_loop_in_path(path):
        if len(path) > 3 and Core.is_neighbour(path[0], path[-1]):
            return True
        return False

    @staticmethod
    def append_new_loop(field, path, loops):
        if Core.is_loop_already_found(field, path):
            return
        set_path = set(path)
        for _, item in enumerate(loops):
            set_item = set(item)
            if set_path == set_item:
                return
            if set_item.issubset(set_path):
                return
        loops.append(path[:])

    @staticmethod
    def dfs(field, point, path, loops, visited, owner):
        x, y = point
        visited[point] = DFS_GRAY

        for i in range(x-1, x+2):
            for j in range(y-1, y+2):
                new_point = Point(i, j)
                if point != new_point and field.field[i][j].owner == owner and not field.field[i][j].captured:
                    if new_point not in visited.keys():
                        visited[new_point] = DFS_GRAY
                        path.append(new_point)

                        if len(path) > 3 and Core.find_loop_in_path(path):
                            Core.append_new_loop(field, path, loops)

                            visited.pop(new_point)
                            path.pop()
                            return
                        Core.dfs(field, new_point, path, loops, visited, owner)
                        path.pop()

    @staticmethod
    def find_all_new_loops(field, point, owner):
        path, loops, visited = [], [], {}
        path.append(point)
        visited[point] = DFS_GRAY
        Core.dfs(field, point, path, loops, visited, owner)
        path.pop()
        return loops

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
                if loop_set == set(item) or set(item).issubset(loop_set) or len(item) == loop_size:
                    return EMPTY_LOOP

        loops = field.loops
        if loops:
            for _, item in loops.items():
                if set(item).issubset(loop_set) or len(item) == loop_size or loop_set == set(item):
                    return LOOP

        return False
