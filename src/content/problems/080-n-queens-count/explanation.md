---
problemId: P080
solutions:
  - { file: solutions/reference.py, label: "Row-by-row backtracking with diagonal invariants", time: "O(n!)", space: "O(n)" }
---
## Approach
Explanation: All squares along any top-left-to-bottom-right diagonal share constant `r - c`, while every top-right-to-bottom-left diagonal shares constant `r + c` [src:think-python]. Checking those two differences plus `cols` in sets turns each square compatibility check into `O(1)` before recursing to row `r + 1` [src:python-tutorial].

## Common mistakes
- Checking only `r - c` without `r + c`, missing reverse-diagonal queen attacks.

## Takeaways
- Matrix diagonals map directly to constant keys `r - c` and `r + c`.

## Related
P081, P082, lesson A5
