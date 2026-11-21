---
problemId: P018
solutions:
  - { file: solutions/reference.py, label: "Horner's method left-to-right doubling", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Horner's method walks left to right from the most significant bit: shifting accumulated value by multiplying by 2 and adding the current bit [src:think-python]. Every single bit is processed in `O(1)` without computing explicit `2 ** i` exponents [src:python-tutorial].

## Common mistakes
- Multiplying `bits[i]` by `2 ** i` from index 0 on the left instead of `2 ** (len - 1 - i)`, which reads the bitstring backwards (`"100"` -> `1` instead of `4`).

## Takeaways
- Horner's scheme (`val = val * base + digit`) converts any positional number base cleanly in a single left-to-right loop.

## Related
P019, P017, lesson A4
