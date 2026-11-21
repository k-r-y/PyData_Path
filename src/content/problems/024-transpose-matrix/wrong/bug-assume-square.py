def transpose_matrix(matrix: list[list]) -> list[list]:
    n = len(matrix)
    return [[matrix[r][c] for r in range(n)] for c in range(n)]
