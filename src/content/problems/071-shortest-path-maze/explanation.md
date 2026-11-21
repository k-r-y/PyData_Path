---
problemId: P071
solutions:
  - { file: solutions/reference.py, label: "BFS shortest path marking visited on enqueue", time: "O(R * C)", space: "O(R * C)" }
---
## Approach
Explanation: On an unweighted grid, Breadth-First Search visits squares layer by layer (first everything 1 step away, then 2 steps away), so the first time `end` is reached is guaranteed to be shortest [src:python-tutorial]. Marking coordinates in `visited` right when appending to `deque` ensures each square enters the queue at most once instead of multiplying exponentially across diagonals [src:python-wiki-timecomplexity].

## Common mistakes
- Marking cells as visited when *popping* rather than when *enqueueing*, causing duplicate queue insertions that explode exponentially on open 60x60 floors.
- Using DFS instead of BFS, which finds *a* path but not necessarily the shortest path.
- Forgetting to check if `start` or `end` is itself a wall (`1`).

## Takeaways
- Unweighted shortest paths always point to BFS with `collections.deque` and eager `visited.add` on enqueue.

## Related
P063, P078, lessons A6 and B8
