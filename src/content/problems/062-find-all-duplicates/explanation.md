---
problemId: P062
solutions:
  - { file: solutions/reference.py, label: "Single-pass seen/dupes sets", time: "O(n log k)", space: "O(n)" }
---
## Approach
Explanation: Using `seen` and `dupes` sets checks duplicates in `O(1)` average lookup per item without emitting repeated copies when an ID appears three or more times [src:python-tutorial]. Calling `nums.count(x)` inside a loop takes `O(n^2)` total work [src:python-wiki-timecomplexity].

## Common mistakes
- Appending to a list `dupes` instead of adding to a set when values repeat 3+ times.
- Using `nums.count(x)` inside a loop/comprehension (`O(n^2)`).

## Takeaways
- Two sets (`seen` + `dupes`) deduplicate repeated encounters cleanly in linear time.

## Related
P011, P030, lesson A6
