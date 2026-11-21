def transpose_matrix(matrix: list[list]) -> list[list]:
    if not matrix or not matrix[0]:
        return []
    return [list(col) for col in zip(*matrix)]
