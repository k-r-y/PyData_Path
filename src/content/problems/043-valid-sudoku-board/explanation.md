---
problemId: P043
solutions:
  - { file: solutions/reference.py, label: "Single-pass 9x9 scan with row, col, and 3x3 box sets", time: "O(1) (fixed 81 cells)", space: "O(1)" }
---
## Approach
Explanation: Mapping each cell `(r, c)` to box coordinates `(r // 3, c // 3)` lets you validate rows, columns, and 3x3 sub-grids simultaneously in a single 81-cell pass [src:python-tutorial]. Sets test membership in `O(1)` [src:python-stdtypes-docs].

## Common mistakes
- Checking rows and columns while forgetting to validate the 9 `3 x 3` sub-boxes.
- Comparing `'.'` empty cells as duplicates.

## Takeaways
- Integer division `r // 3, c // 3` maps 2D coordinates cleanly into sub-grid block keys.

## Related
P082, P024, lesson A6
