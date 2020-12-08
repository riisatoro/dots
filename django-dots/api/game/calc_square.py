
def process(field, colors):
    captured = [0]*len(colors)
    captured_colors = list(map(lambda color: color+"l", colors))
    print(captured_colors)

    for row in field:
        for point in row:
            if point != "E" and point in captured_colors:
                captured[colors.index(point[0])] = captured[colors.index(point[0])] +1
    return captured


if __name__ == "__main__":
    process([["a", "b", "c"], ["a", "b", "c"]], ['R', 'G'])