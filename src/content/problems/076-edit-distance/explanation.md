---
problemId: P076
solutions:
  - { file: solutions/reference.py, label: "Wagner-Fischer 1D rolling DP", time: "O(n * m)", space: "O(min(n, m))" }
---
## Approach
Explanation: Initializing row 0 to `0..m` and column 0 of each row `i` to `i` captures empty-prefix insertion/deletion costs accurately [src:python-tutorial]. When `ca == cb`, no edit is needed so cost equals `prev[j - 1]`; otherwise `1 + min(prev[j], cur[j - 1], prev[j - 1])` picks the cheapest of deletion, insertion, or substitution [src:python-wiki-timecomplexity].

## Common mistakes
- Initializing column 0 to `0` instead of `i` and row 0 to `0` instead of `0..m`.

## Takeaways
- Check empty-string base conditions (`"" -> "abc"`) on every string DP table first.

## Related
P075, P090, lesson B8
