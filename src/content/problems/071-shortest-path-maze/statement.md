An autonomous warehouse robot moves 4-directionally (up, down, left, right) through an `m x n` floor grid where `0` indicates an open aisle and `1` indicates a blocked rack.

Write `shortest_maze_steps(grid: list[list[int]], start: tuple[int, int], end: tuple[int, int]) -> int` returning the minimum number of single-cell moves from `start` to `end`, or `-1` if `end` is unreachable or either endpoint is out of bounds or blocked.
