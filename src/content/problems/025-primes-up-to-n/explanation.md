---
problemId: P025
solutions:
  - { file: solutions/reference.py, label: "Slice-based Sieve of Eratosthenes", time: "O(n log log n)", space: "O(n)" }
---
## Approach
Explanation: Rather than testing divisors per candidate in `O(n^2)`, cross out multiples `p*p, p*p+p, ...` in bulk using Python's C-backed `bytearray` slice assignment [src:python-tutorial]. Every smaller multiple `k * p` for `k < p` was already crossed off by smaller primes, so starting at `p * p` up to `sqrt(n)` suffices in `O(n log log n)` time [src:python-wiki-timecomplexity].

## Common mistakes
- Testing every integer `2..x-1` inside an `O(n^2)` loop.
- Excluding `n` when `n` itself is prime (using `range(2, n)` instead of `range(2, n + 1)`).

## Takeaways
- Slice assignment on `bytearray` makes sieve algorithms blazing fast in pure Python.

## Related
P003, P017, lesson B8
