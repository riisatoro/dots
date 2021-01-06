from .structure import Point, GamePoint, GameField

min_field_size = 5

class Field:
    @staticmethod
    def create_field(height: int, width: int) -> GameField:
        if height < min_field_size or width < min_field_size:
            raise ValueError

        field = []
        for i in range(height):
            tmp_row = []
            for j in range(width):
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
        return field

    @staticmethod
    def change_owner(field: GameField, point: Point, owner: int):
        x, y = point

        if x not in range(len(field.field)) or y not in range(len(field.field[0])):
            raise IndexError

        if owner not in field.players:
            raise ValueError

        if field.field[x][y].owner == None:
            field.field[x][y].owner = owner

        return field

    @staticmethod
    def is_full_field(field: GameField):
        for row in field.field:
            for point in row:
                if point.owner == None:
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
    def find_new_loops(field: GameField, point: Point, owner: int):
        pass

    @staticmethod
    def has_enemy_points(field: GameField, point: Point, owner: int):
        pass

    @staticmethod
    def is_point_in_empty_loop(field: GameField, point: Point, enemy: int):
        pass

    @staticmethod
    def calc_score(field: GameField):
        pass

    @staticmethod
    def set_captured_points(field: GameField, point: Point):
        pass

    @staticmethod
    def is_loop_already_found(field: GameField, loop: [Point]):
        pass