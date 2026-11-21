def diagonal_sums(matrix: list[list[int]]) -> tuple[int, int]:
    n = len(matrix)
    primary = sum(matrix[i][i] for i in range(n))
    secondary = sum(matrix[i][n - 1 - i] for i in range(n) if i != n - 1 - i)
    return (primary, secondary)
