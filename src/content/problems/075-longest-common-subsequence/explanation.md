---
problemId: P075
solutions:
  - { file: solutions/reference.py, label: "Rolling-row 1D DP in O(n * m) time and O(min(n, m)) space", time: "O(n * m)", space: "O(min(n, m))" }
---
## Approach
Explanation: Matching prefixes via a 2D DP recurrence preserves relative ordering and character multiplicity [src:python-tutorial]. Rolling two 1D arrays keeps space linear in the shorter string length while running in quadratic time [src:python-wiki-timecomplexity].

## Common mistakes
- Returning `len(set(a) & set(b))`, which ignores order (`"ab"` vs `"ba"` -> 2 instead of 1) and character duplicates.

## Takeaways
- Whenever an alignment recurrence only reads the previous row, compress the DP table to `O(min(n, m))` space.

## Related
P076, P089, lesson B8
