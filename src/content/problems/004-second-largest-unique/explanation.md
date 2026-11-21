---
problemId: P004
solutions:
  - { file: solutions/reference.py, label: "Single-pass two-variable tracking", time: "O(n)", space: "O(1)" }
  - { file: solutions/alt-set-sort.py, label: "Set deduplication and sort", time: "O(n log n)", space: "O(n)" }
---
## Approach
Explanation: Keep track of the podium spots `first` (gold) and `second` (silver) as you scan the array once. Every time a strictly larger number arrives, shift `first` down to `second` and update `first`. Values equal to `first` are skipped so duplicates never mask the true runner-up.

Initializing sentinels to `None` avoids edge-case bugs with negative numbers or `0`, and runs in `O(n)` time with `O(1)` auxiliary space [src:python-wiki-timecomplexity]. Converting to `set(nums)` and sorting is concise when `O(n log n)` is acceptable [src:python-tutorial].

## Common mistakes
- Sorting without removing duplicates (`sorted(nums)[-2]`), which returns the same value as the maximum when the max appears twice.
- Initializing sentinels to `0` instead of `None`, breaking lists of negative numbers.
- Calling `list.sort()` directly on the caller's list (mutating input).

## Takeaways
- Single-pass tracking beats sorting when only the top `k` (for tiny `k`) distinct values are needed.

## Related
P011, P030, lessons A4 and A6
