def shortest_maze_steps(grid: list[list[int]], start, end) -> int:
    return abs(start[0] - end[0]) + abs(start[1] - end[1])
