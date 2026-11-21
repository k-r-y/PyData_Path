---
problemId: P063
solutions:
  - { file: solutions/reference.py, label: "Iterative flood-fill with visited set", time: "O(R * C)", space: "O(R * C)" }
---
## Approach
Explanation: Think of each unvisited `"1"` cell as discovering a new island, then flooding out orthogonally (up/down/left/right) with a queue or explicit stack to mark every connected cell before continuing the scan [src:python-tutorial]. Tracking visited coordinates in a `set` leaves the caller's matrix intact and avoids `RecursionError` on large winding paths [src:python-wiki-timecomplexity].

## Common mistakes
- Connecting diagonal cells `(-1, -1)` when only orthogonal neighbors belong to the same region.
- Overwriting `grid[r][c] = "0"` directly when inputs must remain unmodified.

## Takeaways
- Iterative `deque` or `stack` flood-fills avoid Python recursion limits on large grids.

## Related
P071, P084, lesson B8
