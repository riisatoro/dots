"""
Module contains class ConvertField, wich allows to convert game field to a different objects
"""
from .point import Point


class ConvertField:
    @staticmethod
    def convert_to_old(field):
        """
        Convert matrix of Point objects to matrix of strings
        """
        old_field = []
        for row in field:
            tmp_row = []
            for col in row:
                if col.color["color"] != "SYSTEM":
                    color = col.color["color"][0]
                    if col.captured:
                        color += "l"
                    tmp_row.append(color)
            if tmp_row:
                old_field.append(tmp_row[:])

        return old_field

    @staticmethod
    def convert_to_new(field):
        """
        Convert matrix of strings to matrix of Point objects
        """
        colors = {
            "E": "EMPTY",
            "R": "RED",
            "B": "BLUE",
        }
        player_id = {
            "E": -1,
            "R": 1,
            "B": 6,
        }

        new_field = []
        new_field.append([Point({"player_id": -1, "color": "SYSTEM"})]*(len(field)+2))
        for row in field:
            tmp_row = [Point({"player_id": -1, "color": "SYSTEM"})]
            for point in row:
                captured = point[-1] == "l"
                tmp_row.append(Point({"player_id": player_id[point[0]], "color": colors[point[0]]}, captured=captured))
            tmp_row.append(Point({"player_id": -1, "color": "SYSTEM"}))
            new_field.append(tmp_row[:])
        new_field.append([Point({"player_id": -1, "color": "SYSTEM"})]*(len(field)+2))
        return new_field
