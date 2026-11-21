def diagonal_sums(matrix: list[list[int]]) -> tuple[int, int]:
    n = len(matrix)
    primary = 0
    secondary = 0
    for i in range(n):
        primary += matrix[i][i]
        secondary += matrix[i][n - 1 - i]
    return (primary, secondary)
