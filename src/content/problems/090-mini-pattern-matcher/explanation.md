---
problemId: P090
solutions:
  - { file: solutions/reference.py, label: "Top-down DP with lru_cache memoization", time: "O(T * P)", space: "O(T * P)" }
---
## Approach
Explanation: Whenever `pattern[j + 1] == '*'`, recursion branches cleanly between matching zero repetitions (`j + 2`) and matching one more character (`i + 1, j`) [src:python-tutorial]. Without memoization, overlapping `"a*a*a*...c"` stars re-explore exponential redundant suffix pairs; caching every `(i, j)` pair bounds states strictly to `T * P` [src:python-wiki-timecomplexity].

## Common mistakes
- Writing plain recursion without memoizing `(i, j)`, triggering catastrophic backtracking on adversarial patterns.
- Stopping when `text` finishes without allowing trailing `a*` pairs to match zero occurrences (`""` vs `"a*b*"`).

## Takeaways
- Memoization turns exponential regex-style backtracking into polynomial DP directly.

## Related
P075, P076, lesson B8
