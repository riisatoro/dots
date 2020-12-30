class Point():
    def __init__(self, color="", user=""):
        self.color = color
        self.user = user

        self.lines = []

        self.is_captured = False
        self.is_in_loop = False
        self.loop_id = []

if __name__ == "__main__":
    pass