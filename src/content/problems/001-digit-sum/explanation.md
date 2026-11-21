---
problemId: P001
solutions:
  - { file: solutions/reference.py, label: "Modulo and floor division", time: "O(d)", space: "O(1)" }
  - { file: solutions/alt-string.py, label: "String digit comprehension", time: "O(d)", space: "O(d)" }
---
## Approach
Explanation: Think of peeling off the rightmost digit of a receipt number one digit at a time. Using `divmod(n, 10)` (or `n % 10` and `n //= 10`) extracts the ones digit and shifts the remaining digits right until `n` reaches `0`. Both approaches run in `O(d)` time where `d` is the number of decimal digits.

Python `int` objects support arbitrary precision rather than fixed 64-bit bounds [src:python-stdtypes-docs], and `divmod(n, 10)` returns `(n // 10, n % 10)` in one built-in call [src:python-tutorial].

## Common mistakes
- Writing `while n > 1:` instead of `while n > 0:`, which drops a leading `1` digit (such as `1000000`).
- Using true division `/` instead of floor division `//`, which turns `n` into a `float` and loses precision on large integers.
- Counting digits (`total += 1`) instead of adding the digit value (`total += rem`).

## Takeaways
- Use `//` and `%` when decomposing integers by base 10 without allocating strings.
- `sum(int(ch) for ch in str(n))` is concise and idiomatic when allocating a short string is acceptable [src:python-tutorial].

## Related
P002, P019, lessons A2 and A4
