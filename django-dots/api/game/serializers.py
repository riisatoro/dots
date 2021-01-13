from dataclasses import asdict

from .structure import GamePoint
from .core import Field


class GameFieldSerializer:
    def to_database(self, data):
        return asdict(data)

    def from_database(self, data, height, width):
        field = data["field"]
        new_field = Field.create_field(height, width)
        for row_index, row in enumerate(field):
            for col_index, point in enumerate(row):
                new_field.field[row_index][col_index] = GamePoint(
                    owner=point.get("owner"), captured=point.get("captured"), border=point.get("border")
                )

        new_field.players = data.get("players")
        new_field.loops = data.get("loops")
        new_field.empty_loops = data.get("empty_loops")
        new_field.score = data.get("score")
        return new_field

    def to_client(self, data, pop_values: list = None):
        client_data = asdict(data)
        if pop_values:
            for key in pop_values:
                client_data.pop(key)
        return client_data
