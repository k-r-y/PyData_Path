from collections import deque


def shortest_maze_steps(grid: list[list[int]], start, end) -> int:
    if not grid or not grid[0]:
        return -1
    rows, cols = len(grid), len(grid[0])
    sr, sc = start
    er, ec = end
    if not (0 <= sr < rows and 0 <= sc < cols and 0 <= er < rows and 0 <= ec < cols):
        return -1
    if grid[sr][sc] != 0 or grid[er][ec] != 0:
        return -1
    if (sr, sc) == (er, ec):
        return 0

    queue = deque([(sr, sc, 0)])
    visited = {(sr, sc)}
    while queue:
        r, c, dist = queue.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in visited:
                if (nr, nc) == (er, ec):
                    return dist + 1
                visited.add((nr, nc))
                queue.append((nr, nc, dist + 1))
    return -1
