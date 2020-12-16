
def process(field, colors):
    captured = [0]*len(colors)
    captured_colors = list(map(lambda color: color[0]+"l", colors))
    colors = list(map(lambda color: color[0], colors))

    for row in field:
        for point in row:
            if point != "E" and point in captured_colors:
                captured[colors.index(point[0])] = captured[colors.index(point[0])] + 1

    captured_dict = dict(zip(colors, captured[::-1]))
    return captured_dict
