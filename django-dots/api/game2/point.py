class Point():
    def __init__(self, color, part_of_loop=False, captured=False, loop_id=[]):
        self.color = color
        self.part_of_loop = part_of_loop
        self.loop_id = loop_id
        self.captured = captured

    def is_free(self):
        return not self.captured and not self.part_of_loop

    def __str__(self):
        return f"{self.color}|loop: {self.part_of_loop}|captured: {self.captured}"

    def __eq__(self, color:str):
        return self.color == color

    def __ne__(self, color:str):
        return not self.color == color

    """
    def __dict__(self):
        dict = {
            "color": self.color,
            "part_of_loop": self.part_of_loop,
            "loop_id": self.loop_id,
            "captured": self.captured,
        }
        return dict
    """
