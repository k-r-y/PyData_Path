---
problemId: P036
solutions:
  - { file: solutions/reference.py, label: "Sort by start then sweep once", time: "O(n log n)", space: "O(n)" }
---
## Approach
Explanation: Sorting intervals by start time brings every potentially overlapping pair adjacent in the sweep [src:python-tutorial]. Comparing `start <= merged[-1][1]` handles both overlaps and touching boundaries like `[1, 4]` + `[4, 5]`, while `max(merged[-1][1], end)` prevents shorter nested windows (`[3, 5]` inside `[1, 10]`) from shrinking the active interval [src:python-wiki-timecomplexity].

## Common mistakes
- Setting `merged[-1][1] = end` instead of `max(merged[-1][1], end)`, which shrinks `[1, 10]` to `[1, 5]` when `[3, 5]` follows.
- Using strict `<` instead of `<=`, leaving touching boundaries unmerged.

## Takeaways
- Sorting first converts arbitrary 1D interval consolidation into a single linear sweep.

## Related
P070, P016, lesson B8
