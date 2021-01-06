from .structure import Point, GamePoint, GameField


class Field:
    @staticmethod
    def create_field(height: int, width: int):
        pass

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