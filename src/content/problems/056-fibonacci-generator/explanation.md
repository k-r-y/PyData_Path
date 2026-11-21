---
problemId: P056
solutions:
  - { file: solutions/reference.py, label: "Infinite generator plus integer power threshold", time: "O(k)", space: "O(1)" }
---
## Approach
Explanation: A Python generator suspends local variables `a` and `b` at each `yield` statement and computes the next value on demand in `O(1)` space [src:python-tutorial]. Comparing `val >= 10 ** (digits - 1)` avoids repeated `str(val)` conversions on large numbers while producing the exact 0-based index cleanly [src:python-wiki-timecomplexity].

## Common mistakes
- Starting the sequence at `1, 1` instead of `0, 1`, shifting every Fibonacci index by 1.
- Returning `1` for `digits == 1` instead of `0`.

## Takeaways
- Generators let you express infinite mathematical sequences with constant memory overhead.

## Related
P057, P035, lesson B3
