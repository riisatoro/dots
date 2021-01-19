
from dataclasses import asdict

from .structure import GamePoint, Point
from .core import Field


class GameFieldSerializer:

    def path_serialize(self, path):
        return [Point(x, y) for x, y in path]

    def to_database(self, data):
        return asdict(data)

    def from_database(self, data, height, width):
        field = data["field"]
        new_field = Field.create_field(height, width)
        for row_index, row in enumerate(field):
            for col_index, point in enumerate(row):
                owner = point.get("owner")
                if owner is not None:
                    owner = int(owner)
                captured = point.get("captured")
                if captured is not None:
                    captured = list(map(int, captured))
                new_field.field[row_index][col_index] = GamePoint(
                    owner=owner, captured=captured, border=point.get("border")
                )

        new_field.players = list(map(int, data.get("players")))
        new_field.score = data.get("score")

        new_field.new_loops = data.get('new_loops')
        for x in range(0, len(new_field.new_loops)):
            new_field.new_loops[x]['path'] = self.path_serialize(new_field.new_loops[x]['path'])

        new_field.new_houses = data.get('new_houses')
        for x in range(0, len(new_field.new_houses)):
            new_field.new_houses[x]['path'] = self.path_serialize(new_field.new_houses[x]['path'])

        return new_field

    def to_client(self, data, pop_values: list = None):
        data.loops = []
        for x in data.new_loops:
            data.loops.append(x['path'])
            print(x["path"])

        client_data = asdict(data)
        if pop_values:
            for key in pop_values:
                client_data.pop(key)
        return client_data
