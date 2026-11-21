---
problemId: P091
solutions:
  - { file: solutions/reference.py, label: "Three-state cycle-detecting DFS with recursive-descent parsing", time: "O(V + E + L)", space: "O(V + L)" }
---
## Approach
Explanation: Spreadsheet cells form a directed dependency graph where formulas reference upstream cells [src:python-tutorial]. Combining 3-color DFS (`unvisited / visiting / visited`) with memoization detects cycles cleanly in `ValueError` while preventing exponential re-evaluation across diamond dependencies like `C2 = C1 + C1` [src:python-wiki-timecomplexity].

## Common mistakes
- Leaving out memoization so diamond graphs re-evaluate exponentially (`C1 -> C2 -> C3 ...`).
- Letting cyclic references overflow Python's recursion limit (`RecursionError`) instead of flagging `ValueError`.

## Takeaways
- Memoization + explicit active-stack tracking (`state == 1`) solves both DAG performance and cycle rejection cleanly.

## Related
P073, P079, lesson B8
