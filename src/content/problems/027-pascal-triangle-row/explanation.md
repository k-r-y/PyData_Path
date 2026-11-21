---
problemId: P027
solutions:
  - { file: solutions/reference.py, label: "Linear binomial recurrence", time: "O(n)", space: "O(n)" }
  - { file: solutions/alt-iterative-rows.py, label: "Iterative row summation", time: "O(n^2)", space: "O(n)" }
---
## Approach
Explanation: Rather than computing all `n` earlier rows in `O(n^2)` time, notice each coefficient follows `C(n, k+1) = C(n, k) * (n - k) // (k + 1)` [src:python-tutorial]. Multiplying before floor-dividing guarantees exact integers with no intermediate floats and runs in linear `O(n)` steps.

## Common mistakes
- Off-by-one confusion between 0-indexed row `0 -> [1]` vs 1-indexed rows.
- Dividing `(n - k) / (k + 1)` before multiplying by `row[-1]`, introducing rounding inaccuracy on larger rows.

## Takeaways
- Multiply before integer floor division (`//`) when computing exact combinatorial recurrences.

## Related
P003, P089, lesson A4
