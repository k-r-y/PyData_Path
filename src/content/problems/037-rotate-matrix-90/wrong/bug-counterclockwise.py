def rotate_90_clockwise(matrix: list[list]) -> list[list]:
    if not matrix:
        return []
    n = len(matrix)
    return [[matrix[r][n - 1 - c] for r in range(n)] for c in range(n)]
