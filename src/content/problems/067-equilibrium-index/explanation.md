---
problemId: P067
solutions:
  - { file: solutions/reference.py, label: "Total sum minus running prefix sum", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Rather than recomputing `sum(nums[:i])` and `sum(nums[i+1:])` cleanly inside an `O(n^2)` loop, compute `total = sum(nums)` once and deduce `right = total - left - nums[i]` in `O(1)` per index [src:python-tutorial]. Checking index `0` automatically compares `0 == total - nums[0]` [src:python-wiki-timecomplexity].

## Common mistakes
- Calling `sum(nums[:i])` on each iteration, turning linear traversal into `O(n^2)`.
- Offsetting the loop `range(1, len(nums) - 1)`, which misses valid equilibrium pivots at index `0` or `len(nums) - 1`.

## Takeaways
- Derive suffix sums algebraically from `total - prefix` to save both extra memory and repeated slicing.

## Related
P041, P040, lesson B8
