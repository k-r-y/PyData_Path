---
problemId: P070
solutions:
  - { file: solutions/reference.py, label: "Sweep line sort by start time with early break", time: "O(n log n + k)", space: "O(n + k)" }
---
## Approach
Explanation: Sorting sessions by start minute ensures every subsequent course `j > i` starts at `s2 >= s1` [src:python-tutorial]. As soon as `s2 >= e1`, no later course can possibly overlap `ordered[i]`, so breaking out makes non-overlapping schedules run in `O(n log n)` instead of `O(n^2)` [src:python-wiki-timecomplexity].

## Common mistakes
- Treating touching boundaries `s2 == e1` as conflicts (`s2 > e1` break instead of `s2 >= e1`).
- Forgetting to order pair IDs as `(min_id, max_id)` and sort the resulting list.

## Takeaways
- Sweep-line sorting + early break turns mostly disjoint overlap queries into near-linear time.

## Related
P036, P051, lesson B8
