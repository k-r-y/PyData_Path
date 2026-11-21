---
problemId: P042
solutions:
  - { file: solutions/reference.py, label: "Two binary searches for lower and upper boundaries", time: "O(log n)", space: "O(1)" }
---
## Approach
Explanation: Instead of stopping at the first match `nums[mid] == target`, record `ans = mid` and keep shrinking the search interval left (`hi = mid - 1`) for the opening boundary or right (`lo = mid + 1`) for the closing boundary [src:python-wiki-timecomplexity]. Even when all 200,000 items match `target`, scanning linearly outward from `mid` would degrade to `O(n)`, whereas two binary searches always finish in `O(log n)` [src:python-tutorial].

## Common mistakes
- Expanding left/right with `while nums[l] == target: l -= 1` after binary search (which degrades to `O(n)` when duplicates fill the array).
- Returning `mid` immediately on the first match without finding bounds.

## Takeaways
- Binary search easily generalizes from "does x exist?" to "where does the first/last x sit?" by recording `ans = mid` and tightening one half.

## Related
P016, P041, lesson B8
