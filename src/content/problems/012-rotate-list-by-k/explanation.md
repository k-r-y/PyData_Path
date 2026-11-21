---
problemId: P012
solutions:
  - { file: solutions/reference.py, label: "Modulo slice concatenation", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Reducing `r = k % len(items)` normalizes any shift count (large, zero, or negative) into `0 <= r < n` [src:python-stdtypes-docs]. When `r == 0`, returning `list(items)` returns a fresh copy so callers never see accidental aliasing; otherwise `items[-r:] + items[:-r]` moves the tail to the front [src:python-tutorial].

## Common mistakes
- Forgetting `r = 0` guard: slicing `items[-0:] + items[:-0]` equals `items[:] + []`, or forgetting `k % n` when `k > len(items)`.
- Dividing by `len(items)` before checking for empty lists (`ZeroDivisionError`).

## Takeaways
- Always take `k % len(items)` after checking `len(items) == 0`.

## Related
P037, P041, lesson A6
