from .structure import Point, GamePoint, GameField

min_field_size = 5

class Field:
    @staticmethod
    def create_field(height: int, width: int) -> GameField:
        if height < min_field_size or width < min_field_size:
            raise ValueError
        
        field = [[GamePoint()] * width] * height
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
        pass

    @staticmethod
    def is_full_field(field: GameField):
        pass

    @staticmethod
    def add_loop(field: GameField, loop: [Point]):
        pass

    @staticmethod
    def add_empty_loop(field: GameField, loop: [Point]):
        pass


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