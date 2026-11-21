---
problemId: P026
solutions:
  - { file: solutions/reference.py, label: "Euclidean remainder loop with zero guard", time: "O(log min(a, b))", space: "O(1)" }
---
## Approach
Explanation: Euclid's algorithm repeatedly shrinks `(x, y) -> (y, x % y)` until remainder `y` reaches zero, finishing in logarithmic steps [src:think-python]. Dividing `abs(a) // x` before multiplying by `abs(b)` computes the LCM cleanly once `x == 0` is handled separately [src:python-tutorial].

## Common mistakes
- Dividing by `gcd == 0` when inputs are `(0, 0)` (`ZeroDivisionError`).
- Leaving negative signs on `gcd` or `lcm` when an input is negative.

## Takeaways
- Always guard `gcd == 0` before dividing for LCM.

## Related
P008, P025, lesson A4
