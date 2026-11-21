def find_pair_indices(amounts: list[int], target: int) -> tuple[int, int] | None:
    n = len(amounts)
    for i in range(n):
        for j in range(i + 1, n):
            if amounts[i] + amounts[j] == target:
                return (i, j)
    return None
