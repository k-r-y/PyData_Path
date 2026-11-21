def rotate_90_clockwise(matrix: list[list]) -> list[list]:
    if not matrix:
        return []
    return [list(col[::-1]) for col in zip(*matrix)]
