
def process(field):
    for row in field:
        if "E" in row:
            return False
    return True
