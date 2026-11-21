---
problemId: P023
solutions:
  - { file: solutions/reference.py, label: "Single index loop over rows", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Because every row index `i` fixes both diagonal columns directly (`i` for the primary diagonal and `n - 1 - i` for the secondary diagonal), only a single loop of `n` steps is needed [src:python-tutorial]. No double nested traversal is necessary.

## Common mistakes
- Writing `matrix[i][n - i]` (off-by-one `IndexError`).
- Using two nested loops `for i ... for j ...` running in `O(n^2)` when only `n` cells on each diagonal matter.

## Takeaways
- Indexed coordinates let you visit matrix diagonals in `O(n)` rather than `O(n^2)`.

## Related
P024, P037, lesson A6
