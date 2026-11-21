---
problemId: P017
solutions:
  - { file: solutions/reference.py, label: "Single-bit bitwise trick n & (n - 1)", time: "O(1)", space: "O(1)" }
  - { file: solutions/alt-divide.py, label: "Repeated halving", time: "O(log n)", space: "O(1)" }
---
## Approach
Explanation: A positive power of two looks like `1000...0` in binary, and subtracting 1 flips all lower zeros to ones (`0111...1`), so bitwise AND gives `0` [src:python-stdtypes-docs]. Guarding `n > 0` prevents `0 & -1 == 0` from misclassifying zero [src:python-tutorial].

## Common mistakes
- Writing `(n & (n - 1)) == 0` without checking `n > 0`, which wrongly returns `True` for `0`.
- Using `math.log2(n).is_integer()`, which loses precision on huge integers like `2**60 + 1`.

## Takeaways
- Arbitrary-precision bitwise/integer math avoids float precision loss on large integers.

## Related
P018, P019, lesson A4
