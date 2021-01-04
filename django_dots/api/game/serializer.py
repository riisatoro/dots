"""
Module contains one serializer for the game field
"""
from .point import Point


class GameFieldSerializer:
    """
    Serializer for the game field
    """
    @staticmethod
    def to_json(field):
        """
        Convert matrix of Point classes to json object
        """
        json_field = [[col.__dict__ for col in row] for row in field]
        return json_field

    @staticmethod
    def from_json(field):
        """
        Convert JSON object to matrix of Point classes
        """
        obj_field = []
        for row in field:
            tmp_row = []
            for col in row:
                tmp_row.append(
                    Point(
                        col["color"],
                        part_of_loop=col["part_of_loop"],
                        captured=["captured"],
                        loop_id=col["loop_id"]
                    )
                )
            obj_field.append(tmp_row[:])

        return obj_field
