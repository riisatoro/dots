import itertools
from collections import Counter, defaultdict
from shapely.geometry import Point as shapePoint
from shapely.geometry import Polygon as shapePolygon
from .structure import Point, GamePoint, GameField
import pprint


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

        if field.field[y][x].owner is None and not field.field[y][x].border and not field.field[y][x].is_captured:
            field.field[y][x].owner = owner

        return field

    @staticmethod
    def is_full_field(field: GameField):
        for row in field.field:
            for point in row:
                if point.owner is None and point.captured is None and not point.border:
                    return False
        return True


class Core:
    @staticmethod
    def process_point(field: GameField, point: Point, owner: int):
        field = Field.change_owner(field, point, owner)
    
        all_paths = Core.build_all_loops(field.field, point, owner)

        path_stats = [
            {
                'path': path,
                'owner': owner,
                'stats': Core.prepare_loop_stats(field.field, path, owner)
            }
            for path in all_paths if Core.is_neighbour(path[0], path[-1])
        ]

        normal_paths = [
            x for x in path_stats
            if x['stats']['empty'] or x['stats']['enemy']
        ]

        loops = [
            p for p in normal_paths
            if p['stats']['enemy']
        ]

        for loop in loops:
            field = Core.add_new_loop(field, loop['path'], owner)

        old_houses = field.new_houses

        for possible_loop in old_houses:
            field = Core.add_new_loop(
                field,
                possible_loop['path'],
                possible_loop['owner']
            )

        field.new_houses = []

        empty_loops = [
            p for p in normal_paths
            if not p['stats']['enemy']
        ]
        possible_houses = [*old_houses, *empty_loops]
        field = Core.add_houses(field, possible_houses)

        # from .draw import draw_field; draw_field(field)
        return field

    @staticmethod
    def add_new_loop(game_field, path, owner):
        stats = Core.prepare_loop_stats(game_field.field, path, owner)
        if not stats['enemy'] or stats['path_captured']:
            return game_field

        point_lists = [v for v in stats.values() if isinstance(v, list)]
        captured_points = set(itertools.chain.from_iterable(point_lists))
        for point in captured_points:
            game_field.field[point.y][point.x].captured_by.append(owner)

        game_field.new_loops.append({'owner': owner, 'path': path})
        return game_field
    
    @staticmethod
    def add_houses(game_field, houses):
        captured_empty_points = set()

        def add_new_house(path, owner):
            stats = Core.prepare_loop_stats(game_field.field, path, owner)
            if stats['enemy'] or stats['path_captured']:
                return

            all_points_processed = any(
                p in captured_empty_points for p in stats['empty']
            )
            if all_points_processed:
                return

            for point in stats['empty']:
                captured_empty_points.add(point)

            game_field.new_houses.append({
                'owner': owner, 'path': path
            })
        
        for house in houses:
            add_new_house(house['path'], house['owner'])

        return game_field

    @staticmethod
    def get_game_stats(field):
        captured_points = [
            p.captured_by[-1]
            for row in field.field
            for p in row if
            p.is_captured
        ]
        result = Counter(captured_points)
        return dict(result)

    @staticmethod
    def build_all_loops(field, starting_point, owner):
        path_root = "ROOT"
        parents = {starting_point: path_root}
        loops = []

        def build_path(point, root):
            if point == root or point == path_root:
                return [starting_point if root == path_root else root]
            return [
                *build_path(parents[point], root),
                point,
            ] 

        def do_dfs(point):
            neighbors = [
                Point(x, y)
                for x in range(point.x-1, point.x+2)
                for y in range(point.y-1, point.y+2) 
            ]
            
            related_neighbors = [
                p for p in neighbors
                if p != point
                and not field[p.y][p.x].is_captured
                and field[p.y][p.x].owner == owner
            ]

            parent = parents.get(point)
            for neigbor in related_neighbors:
                neigbor_parent = parents.get(neigbor)
                if neigbor_parent and neigbor_parent != point:
                    path = build_path(neigbor, starting_point)
                    if len(path) > 3:
                        loops.append(path)
                    continue

                parents[neigbor] = point
                do_dfs(neigbor)
                parents.pop(neigbor)

        do_dfs(starting_point)
        return loops

    @staticmethod
    def prepare_loop_stats(field, path, owner):
        polygon = shapePolygon([
            shapePoint(point.x, point.y)
            for point in path
        ])
        min_x, min_y, max_x, max_y = map(int, polygon.bounds)
        result = {
            'empty': [],
            'captured': [],
            'own': [],
            'enemy': [],
            'path_captured': any(
                field[p.y][p.x].is_captured
                for p in path
            )
        }
        points = [
            (Point(x, y), field[y][x])
            for x in range(min_x, max_x+1)
            for y in range(min_y, max_y+1)
        ]

        for point, point_data in points:
            if polygon.contains(shapePoint(point)):
                if point_data.is_captured:
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
