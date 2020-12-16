
def process(field, color):
    captured = 0
    for row in field:
        for point in row:
            if point != "E" and point == color+"l":
                captured += 1

    return captured
