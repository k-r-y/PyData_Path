---
problemId: P079
solutions:
  - { file: solutions/reference.py, label: "Kahn BFS with min-heap deterministic tie-breaking", time: "O((V + E) log V)", space: "O(V + E)" }
---
## Approach
Explanation: Standard Kahn's topological sort drains nodes whose prerequisite count hits zero [src:python-tutorial]. Swapping FIFO `deque` for a `heapq` min-heap guarantees the smallest available ID is chosen at every step cleanly [src:python-wiki-timecomplexity]. Returning `order if len(order) == num_courses else []` detects any cycles (nodes whose in-degree never dropped to 0).

## Common mistakes
- Reversing edge direction (`course -> prereq`) instead of `prereq -> course`.
- Returning a partial schedule without verifying `len(order) == num_courses` when a cycle leaves some courses blocked.

## Takeaways
- Kahn's algorithm detects cycles cleanly whenever fewer than `V` nodes leave the 0-indegree heap.

## Related
P071, P091, lesson B8
