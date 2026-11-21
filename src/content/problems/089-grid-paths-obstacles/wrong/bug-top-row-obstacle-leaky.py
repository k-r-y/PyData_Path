def unique_paths(grid: list[list[int]]) -> int:
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    dp = [[1 if grid[r][c] == 0 else 0 for c in range(cols)] for r in range(rows)]
    for r in range(1, rows):
        for c in range(1, cols):
            if grid[r][c] == 0:
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[-1][-1]
