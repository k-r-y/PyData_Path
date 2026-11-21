def count_n_queens(n: int) -> int:
    cols = set()
    diag1 = set()
    diag2 = set()

    def backtrack(r: int) -> int:
        if r == n:
            return 1
        total = 0
        for c in range(n):
            d1 = r - c
            d2 = r + c
            if c in cols or d1 in diag1 or d2 in diag2:
                continue
            cols.add(c)
            diag1.add(d1)
            diag2.add(d2)
            total += backtrack(r + 1)
            cols.remove(c)
            diag1.remove(d1)
            diag2.remove(d2)
        return total

    return backtrack(0)
