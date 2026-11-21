def count_n_queens(n: int) -> int:
    cols = set()
    diag1 = set()
    def dfs(r: int) -> int:
        if r == n:
            return 1
        ans = 0
        for c in range(n):
            if c in cols or (r - c) in diag1:
                continue
            cols.add(c); diag1.add(r - c)
            ans += dfs(r + 1)
            cols.remove(c); diag1.remove(r - c)
        return ans
    return dfs(0)
