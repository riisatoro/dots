import itertools
from collections import Counter
from shapely.geometry import Point as shapePoint
from shapely.geometry import Polygon as shapePolygon
from .structure import Point, GamePoint, GameField


min_field_size = 5


class Field:
    @staticmethod
    def create_field(height: int, width: int) -> GameField:
        if height < min_field_size or width < min_field_size:
            raise ValueError("Field height or width must be 5 or bigger")

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
                if not point.owner and not point.is_captured and not point.border:
                    return False
        return True


class Core:
    @staticmethod
    def process_point(field: GameField, point: Point, owner: int) -> GameField:
        """
        Update point state and all loops in the game
        """
        field = Field.change_owner(field, point, owner)

        #all_paths = Core.build_loops_cached(field.field, point, owner)
        all_paths = Core.build_loops(field.field, point, owner)

        path_stats = [
            {
                'path': path,
                'owner': owner,
                'stats': Core.prepare_loop_stats(field.field, path, owner)
            }
            for path in all_paths if Core.is_neighbours(path)
        ]

        normal_paths = [
            x for x in path_stats
            if Core.is_neighbours(x['path'])
            and x['stats']['empty']
            or x['stats']['enemy']
        ]

        loops = [
            p for p in normal_paths
            if p['stats']['enemy']
        ]
        loops.sort(key=lambda x: len(x['path']))

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
        possible_houses.sort(key=lambda x: len(x['path']))

        field = Core.add_houses(field, possible_houses)

        result = {x: 0 for x in field.players}
        for key, value in Core.get_game_stats(field).items():
            result[key] = value

        field.score = result
        return field

    @staticmethod
    def add_new_loop(game_field: GameField, path: list, owner: int) -> GameField:
        """
        Add a new loops that is captured at least one enemy point
        """
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
    def add_houses(game_field: GameField, houses: list) -> GameField:
        """
        Add houses with the minimal length to the GameField
        """
        captured_empty_points = set()

        def add_new_house(path, owner):
            stats = Core.prepare_loop_stats(game_field.field, path, owner)
            if stats['enemy'] or stats['path_captured']:
                return

            all_points_processed = all(
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
    def get_game_stats(field: GameField) -> dict:
        """
        Calc all captured points by all users
        """
        captured_points = [
            p.captured_by[-1]
            for row in field.field
            for p in row
            if p.is_captured
            and p.owner is not None
            and p.owner != p.captured_by[-1]

        ]
        result = Counter(captured_points)
        return dict(result)

    @staticmethod
    def generate_neighbors(field: [[Point]], point: Point, owner: int) -> [Point]:
        """ Find all neighbors for the current point and owner """
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
        return related_neighbors

    @staticmethod
    def build_loops(field, starting_point, owner):
        loops = []
        path = []

        def dfs(point, path, segment):
            neighbors = Core.generate_neighbors(field, point, owner)
            related_neigbors = [
                p for p in neighbors
                if p not in path
                and len(Core.generate_neighbors(field, p, owner)) < 8
            ]

            for neighbor in related_neigbors:
                segments = Core.get_all_segments(field, neighbor, owner)
                for seg in segments:
                    if seg & segment:
                        path.append(neighbor)
                        if len(path) > 3 and Core.is_neighbour(neighbor, starting_point):
                            loops.append(path.copy())
                            path.pop()
                            continue
                        else:
                            dfs(neighbor, path, seg | segment)
                        path.pop()



        segments = Core.get_all_segments(field, starting_point, owner)
        path.append(starting_point)
        for segment in segments:
            dfs(starting_point, path, segment)

        return loops

    @staticmethod
    def build_loops_cached(field: [[Point]], starting_point: Point, owner: int) -> list:
        """
        Build all loops in the game field from the stratring point; cache all pathes
        """
        cached_paths = {}
        loops = []

        def dfs(point: Point, parents):
            """ Recursively cached all paths and find loops from starting point """
            if point in cached_paths:
                return cached_paths[point]

            parent_point = parents[0] if len(parents) > 0 else None

            neighbors = Core.generate_neighbors(field, point, owner)
            related_neighbors = [
                p for p in neighbors
                if p != parent_point
                and len(Core.generate_neighbors(field, p, owner)) < 8
            ]
            new_parents = [point] + parents

            cached_paths[point] = []
            for neighbor in related_neighbors:
                if neighbor in parents:
                    cached_paths[point].append((neighbor, point))
                else:
                    for path in dfs(neighbor, new_parents):
                        if path[0] == point:
                            if len(path) > 3:
                                loops.append(path)
                        else:
                            cached_paths[point].append(path + (point,))

            return cached_paths[point]

        if len(Core.generate_neighbors(field, starting_point, owner)) < 2:
            return loops

        dfs(starting_point, [])
        return loops

    @staticmethod
    def prepare_loop_stats(field: GameField, path: [Point], owner: int) -> dict:
        """
        Find all points that belong to the path and return all of them, sorted by type
        """
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
                if point_data.is_captured and point_data.captured_by[-1] == owner:
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
    def is_neighbour(point_1: Point, point_2: Point) -> bool:
        """ Check if two points are neighbors """
        equals = point_1 == point_2
        horisontal = abs(point_1[0] - point_2[0]) < 2
        vertical = abs(point_1[1] - point_2[1]) < 2
        diagonal = (horisontal - vertical) <= 2
        return not equals and horisontal and vertical and diagonal

    @staticmethod
    def is_neighbours(path: [Point]) -> bool:
        """ Check if each point has 2 neighbor """
        for i in range(1, len(path)):
            if not Core.is_neighbour(path[i-1], path[i]):
                return False
        return True

    @staticmethod
    def get_all_segments(field, point, owner):
        list_of_sides = []
        list_of_neigbors = [
            Point(0, -1), Point(1, -1), Point(1, 0), Point(1, 1), 
            Point(0, 1), Point(-1, 1), Point(-1, 0), Point(-1, -1)
        ]

        for index in range(1, len(list_of_neigbors)+1):
            this = list_of_neigbors[index-1]
            neigbor = list_of_neigbors[index%len(list_of_neigbors)]
            
            this_point = Point(point.x+this.x, point.y+this.y)
            neigbor_point = Point(point.x+neigbor.x, point.y+neigbor.y)

            points_set = set()
            
            if field[this_point.y][this_point.x].owner != owner and not field[this_point.y][this_point.x].is_captured:
                points_set.add(this_point)
            if field[neigbor_point.y][neigbor_point.x].owner != owner and not field[neigbor_point.y][neigbor_point.x].is_captured:
                points_set.add(neigbor_point)

            if list_of_sides:
                for index, item in enumerate(list_of_sides):
                    if item & set([this_point, neigbor_point]):
                        list_of_sides[index] = item.union(points_set)
                        break
                else:
                    if points_set:
                        list_of_sides.append(points_set)
            else:
                if points_set:
                    list_of_sides = [points_set]

        return list_of_sides
