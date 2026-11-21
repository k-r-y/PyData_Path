Given a square `n x n` matrix of integers, write `diagonal_sums(matrix: list[list[int]]) -> tuple[int, int]` returning `(primary_sum, secondary_sum)`:
- `primary_sum`: sum along main diagonal `matrix[i][i]`.
- `secondary_sum`: sum along anti-diagonal `matrix[i][n - 1 - i]`.
- Empty `[]` returns `(0, 0)`.
