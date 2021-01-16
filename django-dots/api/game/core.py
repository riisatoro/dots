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
                if point.owner is None and point.captured is None and not point.border:
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

import time
from collections import Counter
from _collections import defaultdict
class Core:
    @staticmethod
    def player_set_point(field: GameField, point: Point, owner: int):
        
        start_time = time.time()
        field = Field.change_owner(field, point, owner)
        #print("--- %s seconds on change_owner() ---" % (time.time() - start_time))

        start_time = time.time()
        # loops = Core.find_all_new_loops(field, point, owner)

        all_loops = Core.find_all_loops(field.field, point, owner)
        loop_stats = [
            {
                'loop': loop,
                'stats': Core.prepare_loop_stats(field.field, loop, owner)
            }
            for loop in all_loops
            if len(loop) > 3
        ]
        normal_loops = [
            s for s in loop_stats
            if s['stats']['empty'] or s['stats']['enemy']
        ]
        enemy_loops = [s for s in normal_loops if s['stats']['enemy']]
        houses = [s for s in normal_loops if not s['stats']['enemy']]
        print(enemy_loops, houses)

        #print("--- %s seconds on find_all_new_loops() ---" % (time.time() - start_time))
        """
        start_time = time.time()
        field = Core.add_loops_and_capture_points(field, loops, owner)
        #print("--- %s seconds on add_loops_and_capture_points() ---" % (time.time() - start_time))
        
        start_time = time.time()
        empty_loop_id = Core.is_point_in_empty_loop(field, point)
        #print("--- %s seconds on is_point_in_empty_loop() ---" % (time.time() - start_time))

        if not loops and empty_loop_id:
            start_time = time.time()
            loop = field.empty_loops.pop(empty_loop_id)
            x, y = loop[0]
            owner = field.field[x][y].owner

            field = Core.add_loops_and_capture_points(field, [loop], owner)
            #print("--- %s seconds when point is empty loop ---" % (time.time() - start_time))
        """
        return field

    @staticmethod
    def find_all_loops(field, starting_point, owner):
        path_root = "ROOT"
        parents = {}
        loops = []

        def build_loop(point, root):
            if point == root or point == path_root:
                return [starting_point]
            return [
                *build_loop(parents[point], root),
                point
            ] 

        def do_dfs(point):
            neighbors = [
                Point(x, y)
                for x in range(point.x-1, point.x+2)
                for y in range(point.y-1, point.y+2) 
            ]
            parent = parents.get(point)
            related_neighbors = [
                p for p in neighbors
                if p != point
                and field[p.x][p.y].owner == owner
                and p != parent
            ]
            for neigbor in related_neighbors:
                neigbor_parent = parents.get(neigbor)
                if neigbor_parent and (neigbor_parent != point or neigbor_parent == path_root):
                    loops.append(build_loop(neigbor, point))
                    continue

                parents[neigbor] = point
                do_dfs(neigbor)

        parents[starting_point] = path_root
        do_dfs(starting_point)
        return loops

    @staticmethod
    def prepare_loop_stats(field, loop, owner):
        polygon = shapePolygon([
            shapePoint(point.x, point.y)
            for point in loop
        ])
        result = {
            'empty': [],
            'captured': [],
            'own': [],
            'enemy': []
        }
        for y, row in enumerate(field):
            for x, point_data in enumerate(row):
                if polygon.contains(shapePoint(x, y)):
                    point = Point(x, y)
                    if point_data.captured:
                        result['captured'].append(point)
                    elif point_data.owner == owner:
                        result['own'].append(point)
                    elif not point_data.owner:
                        result['empty'].append(point)
                    elif point_data.owner != owner:
                        result['enemy'].append(point)
                    else:
                        raise ValueError('Unexpected clause')
        return result

    @staticmethod
    def is_neighbour(point_1, point_2):
        equals = point_1 == point_2
        horisontal = abs(point_1[0] - point_2[0]) < 2
        vertical = abs(point_1[1] - point_2[1]) < 2
        diagonal = (horisontal - vertical) <= 2
        return not equals and horisontal and vertical and diagonal

    @staticmethod
    def find_loop_in_path(path):
        indexes = []
        if len(path) > 3:
            for i in range(0, len(path)-3):
                if Core.is_neighbour(path[i], path[-1]):
                    indexes.append(i)
        return indexes

    @staticmethod
    def append_new_loop(pathes, loops):
        set_of_path = set(pathes)
        for index, item in enumerate(loops):
            set_of_item = set(item)
            if set_of_path.issubset(set_of_item):
                loops[index] = pathes.copy()

        loops.append(pathes.copy())
        return True

    @staticmethod
    def get_loops_from_path(path, loops):
        set_of_loops = list(map(set, loops))
        # ---
        index = False
        # ---
        for i in range(0, len(path)-3):
            if Core.is_neighbour(path[i], path[-1]):
                for points_set in set_of_loops:
                    if points_set.issubset(set(path[i:])):
                        return
                else:
                    # ---
                    #new_loops.append(path[i:].copy())
                    index = i
        
        if index is not False:
            loops.append(path[index:].copy())
        # ---

    @staticmethod
    def filter_only_new_loops(loops, captured_loops, empty_loops):
        for index, loop in enumerate(loops):
            if not loops:
                return
            loop_set = set(loop)
            for captured in captured_loops:
                if captured.issubset(loop_set):
                    loops.pop(index)
                    break
        
            for empty in empty_loops:
                if empty.issubset(loop_set):
                    loops.pop(index)
                    break

    @staticmethod
    def has_less_three_siblings(loop):
        # check if last point has no  more than 2 sibling
        for index, point in enumerate(loop[len(loop)-4:]):
            amount = 0
            for sibling in loop[len(loop)-4:]:
                if Core.is_neighbour(point, sibling):
                    amount += 1
                if amount > 2:
                    return index
        return False

    @staticmethod
    def dfs(field, point, path, loops, owner):
        if point == Point(9, 3) or (path and path[0] == Point(9, 3)):
            #import ipdb; ipdb.set_trace()
            pass
        x, y = point
        surrounded_points = [
            Point(i, j) 
            for i in range(x-1, x+2) 
            for j in range(y-1, y+2) 
            if Point(i, j) != point
                and Point(i, j) not in path
                and not field[i][j].border
                and field[i][j].owner == owner
                and field[i][j].captured == None
        ]

        path.append(point)
        # if len(path) > 3:
        #     index = Core.has_less_three_siblings(path)
        #     if index != False:
        #         return
        #     #    return len(path) - index - 1
        # 
        #     Core.get_loops_from_path(path, loops)
        
        for next_point in surrounded_points:
            Core.dfs(field, next_point, path, loops, owner)
            path.pop()

    @staticmethod
    def pop_with_common_points(loops):
        res = {}
        for loop in loops:
            key = (loop[1], loop[-1])
            if key in res.keys():
                res[key] = min([res[key], loop], key=len)
            else:
                res[key] = loop
        return list(res.values())

    @staticmethod
    def find_all_new_loops(field, point, owner):
        x, y = point
        surrounded_points = [
            Point(i, j) 
            for i in range(x-1, x+2) 
            for j in range(y-1, y+2) 
            if Point(i, j) != point
                and not field.field[i][j].border
                and field.field[i][j].owner == owner
                and field.field[i][j].captured == None
        ]
        if len(surrounded_points) < 2:
            return []

        path, loops = [], []
        
        captured_loops = []
        empty_loops = []
        if field.loops:
            captured_loops = list(map(set, field.loops.values()))
        if field.empty_loops:
            empty_loops = list(map(set, field.empty_loops.values()))
        
        Core.dfs(field.field, point, path, loops, owner)
        
        loops = Core.pop_with_common_points(loops)
        Core.filter_only_new_loops(loops, captured_loops, empty_loops)

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
    def only_empty_captured(field, loop):
        for x, y in loop:
            if field[x][y].owner is not None:
                return False
        return True

    @staticmethod
    def is_empty_loop(field, captured):
        for x, y in captured:
            if field[x][y].owner is not None:
                return False
        return True

    @staticmethod
    def add_loops_and_capture_points(field, loops, owner):
        for loop in loops:
            captured = Core.find_all_captured_points(field, loop, owner)
            if not captured:
                continue

            if Core.find_enemy_captured(field, captured, owner):
                field.loops = Field.add_loop(field.loops, loop)
                field = Core.set_captured_points(field, captured, owner)
                field = Core.calc_score(field)
            else:
                if Core.is_empty_loop(field.field, captured):
                    field.empty_loops = Field.add_loop(field.empty_loops, loop)

        return field

    @staticmethod
    def find_all_captured_points(field, loop: [Point], owner: int):
        polygon = shapePolygon(loop)
        captured = []

        for x in range(1, len(field.field)-1):
            for y in range(1, len(field.field[0])-1):
                if field.field[x][y].owner != owner or (field.field[x][y].owner == owner and field.field[x][y].captured is not None):
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
    def calc_score(field: GameField):
        score = {}
        for player in field.players:
            score[player] = 0

        for row in field.field:
            for point in row:
                if point.captured and point.owner != point.captured[-1] and point.owner is not None:
                    score[point.captured[-1]] += 1

        field.score = score
        return field

    @staticmethod
    def set_captured_points(field: GameField, points: [Point], owner: int):
        for x, y in points:
            if field.field[x][y].captured is not None:
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
