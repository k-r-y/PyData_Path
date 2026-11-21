---
problemId: P003
solutions:
  - { file: solutions/reference.py, label: "Arithmetic series with inclusion-exclusion", time: "O(1)", space: "O(1)" }
---
## Approach
Explanation: Rather than walking through millions of numbers one by one, notice that the multiples of any step `k` up to `limit = n - 1` form `k * (1 + 2 + ... + count)` where `count = limit // k`. Using integer floor division `//` avoids floating-point rounding completely [src:python-tutorial].

By inclusion-exclusion, numbers divisible by 3 or 5 equal multiples of 3 plus multiples of 5 minus multiples of 15 (which were added twice) [src:think-python].

## Common mistakes
- Including `n` itself instead of stopping at `n - 1`.
- Double-counting multiples of 15 (`sum(3) + sum(5)`).
- Using a naive loop over `range(n)`, which times out when `n` reaches tens of millions.

## Takeaways
- Arithmetic progression sums turn linear counting loops into constant-time O(1) formulas.
- Keep exact integer arithmetic with `// 2` instead of `/ 2` on huge integers.

## Related
P001, P007, lessons A4 and B8
