---
problemId: P014
solutions:
  - { file: solutions/reference.py, label: "Guarded division with elif ladder", time: "O(n)", space: "O(u)" }
---
## Approach
Explanation: Always check `if scores:` before dividing by `len(scores)` to prevent `ZeroDivisionError` on students who have no submitted grades yet [src:python-tutorial]. Checking descending `>= 90`, `>= 80`, `>= 70`, `>= 60` in an `if/elif` chain cleanly enforces exact inclusive boundaries [src:python-stdtypes-docs].

## Common mistakes
- Dividing `sum(scores) / len(scores)` without guarding empty lists.
- Using floor division `//` instead of `/`, truncating fractional scores like `59.9`.

## Takeaways
- Guard every denominator with `if len(seq) > 0:` and evaluate ordered score thresholds from highest to lowest.

## Related
P007, P059, lessons A4 and A6
