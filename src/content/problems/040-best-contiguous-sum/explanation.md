---
problemId: P040
solutions:
  - { file: solutions/reference.py, label: "Kadane's dynamic programming scan", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Kadane's insight decides at each element `x` whether extending the current contiguous streak (`cur + x`) beats throwing away a negative prefix and starting anew (`x`) [src:python-tutorial]. Seeding both `cur` and `best` at `nums[0]` ensures all-negative inputs return the least-negative value rather than wrongly clamping at `0` [src:python-wiki-timecomplexity].

## Common mistakes
- Initializing `best = 0` and clamping `cur = max(0, cur + x)`, which fails when every day is negative (`[-8, -3, -5] -> 0` instead of `-3`).
- Checking all `(i, j)` windows in `O(n^2)` quadratic time.

## Takeaways
- Seed rolling max trackers from `nums[0]` whenever non-empty negative subarrays are valid.

## Related
P066, P067, lesson B8
