from shapely.geometry import Point as shapePoint
from shapely.geometry import Polygon as shapePolygon
from .structure import Point, GamePoint, GameField

min_field_size = 5

DFS_WHITE = "WHITE"
DFS_GRAY = "GRAY"
DFS_BLACK = "BLACK"


class Field:
    @staticmethod
    def create_field(height: int, width: int) -> GameField:
        if height < min_field_size or width < min_field_size:
            raise ValueError("Field height or width must be bigger than 5")

        field = []
        border = [GamePoint(border=True)] * (width + 2)

        field.append(border)
        for _ in range(height):
            tmp_row = []
            for j in range(width+2):
                if j < 1 or j == width+1:
                    tmp_row.append(GamePoint(border=True))
                else:
                    tmp_row.append(GamePoint())
            field.append(tmp_row)
        field.append(border)

        return GameField(field)

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
            raise ValueError("Can't add player to the score table - invalid player ID")

        if field.score:
            field.score[player] = 0
        else:
            field.score = {player: 0}
        return field

    @staticmethod
    def change_owner(field: GameField, point: Point, owner: int):
        x, y = point

        if owner not in field.players:
            raise ValueError("Player ID is not in the GameField")

        if field.field[x][y].owner is None and not field.field[x][y].border and not field.field[x][y].captured:
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
    def add_loop(field_loops, loop: [Point]):
        if not field_loops:
            return {1: loop}

        for key, item in field_loops.items():
            if set(item).issubset(set(loop)):
                return field_loops
            if set(loop).issubset(set(item)):
                field_loops[key] = loop
                return field_loops

        field_loops[max(field_loops.keys())+1] = loop
        return field_loops


class Core:
    @staticmethod
    def player_set_point(field: GameField, point: Point, owner: int):
        field = Field.change_owner(field, point, owner)
        loops = Core.find_all_new_loops(field, point, owner)
        field = Core.add_loops_and_capture_points(field, loops, owner)
        empty_loop_id = Core.is_point_in_empty_loop(field, point)

        if not loops and empty_loop_id:
            loop = field.empty_loops.pop(empty_loop_id)
            x, y = loop[0]
            owner = field.field[x][y].owner

            field = Core.add_loops_and_capture_points(field, [loop], owner)

        return field

    @staticmethod
    def is_neighbour(point_1, point_2):
        equals = point_1 == point_2
        horisontal = abs(point_1[0] - point_2[0]) < 2
        vertical = abs(point_1[1] - point_2[1]) < 2
        diagonal = (horisontal - vertical) <= 2
        return not equals and horisontal and vertical and diagonal

    @staticmethod
    def find_loop_in_path(path):
        return len(path) > 3 and Core.is_neighbour(path[0], path[-1])

    @staticmethod
    def append_new_loop(pathes, loops):
        set_of_path = set(pathes)
        for index, item in enumerate(loops):
            set_of_item = set(item)
            if set_of_path.issubset(set_of_item):
                loops[index] = pathes.copy()
                return loops
            if set_of_item.issubset(set_of_path):
                return loops

        loops.append(pathes.copy())
        return loops

    @staticmethod
    def dfs(field, point, path, loops, owner):
        x, y = point

        for i in range(x-1, x+2):
            for j in range(y-1, y+2):
                new_point = Point(i, j)
                if point != new_point and not field[i][j].border and field[i][j].owner == owner and new_point not in path and field[i][j].captured is None:
                    path.append(new_point)
                    if Core.find_loop_in_path(path):
                        loops = Core.append_new_loop(path, loops)
                    Core.dfs(field, new_point, path, loops, owner)
                    path.pop()

    @staticmethod
    def find_all_new_loops(field, point, owner):
        path, loops, visited = [], [], {}
        path.append(point)
        visited[point] = DFS_GRAY
        Core.dfs(field.field, point, path, loops, owner)
        path.pop()
        return loops

    @staticmethod
    def find_enemy_captured(field, points, owner):
        if len(points) == 0:
            return False
        for x, y in points:
            point = field.field[x][y]
            if not point.border and point.owner is not None and point.owner != owner:
                if point.captured is None or point.captured[-1] != owner:
                    return True
        return False

    @staticmethod
    def add_loops_and_capture_points(field, loops, owner):
        for loop in loops:
            
            captured = Core.find_all_captured_points(field, loop, owner)

            if not Core.find_enemy_captured(field, captured, owner):
                field.empty_loops = Field.add_loop(field.empty_loops, loop)
            else:
                field.loops = Field.add_loop(field.loops, loop)
                field = Core.set_captured_points(field, captured, owner)
                field = Core.calc_score(field, loop, owner)
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
                if loop_set == set(item) or set(item).issubset(loop_set) or len(item) == loop_size:
                    return True

        loops = field.loops
        if loops:
            for _, item in loops.items():
                if set(item).issubset(loop_set) or len(item) == loop_size or loop_set == set(item):
                    return True

        return False
