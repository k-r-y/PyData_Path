from collections import deque


def shortest_maze_steps(grid: list[list[int]], start, end) -> int:
    rows, cols = len(grid), len(grid[0])
    sr, sc = start
    er, ec = end
    if grid[sr][sc] == 1 or grid[er][ec] == 1:
        return -1
    queue = deque([(sr, sc, 0)])
    visited = set()
    while queue:
        r, c, d = queue.popleft()
        visited.add((r, c))
        if (r, c) == (er, ec):
            return d
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in visited:
                queue.append((nr, nc, d + 1))
    return -1
