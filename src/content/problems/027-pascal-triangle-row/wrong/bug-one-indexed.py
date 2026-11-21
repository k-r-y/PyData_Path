def pascal_row(n: int) -> list[int]:
    row = [1]
    for k in range(n - 1):
        row.append(row[-1] * (n - 1 - k) // (k + 1))
    return row
