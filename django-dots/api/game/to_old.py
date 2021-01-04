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
                if col.color != "SYSTEM":
                    color = col.color[0]
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
        new_field = []
        new_field.append([Point("SYSTEM")]*len(field))
        for row in field:
            tmp_row = [Point("SYSTEM")]
            for point in row:
                captured = point[-1] == "l"
                tmp_row.append(Point(colors[point[0]], captured=captured))
            tmp_row.append(Point("SYSTEM"))
            new_field.append(tmp_row[:])
        new_field.append([Point("SYSTEM")]*len(field))
        return new_field
