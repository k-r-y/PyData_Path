---
problemId: P086
solutions:
  - { file: solutions/reference.py, label: "Balanced max-heap and min-heap around stream middle", time: "O(log n) add / O(1) median", space: "O(n)" }
---
## Approach
Explanation: Sorting all seen numbers on every median query takes `O(n log n)` per call, turning 12,000 updates into ~`O(n^2 log n)` [src:python-wiki-timecomplexity]. Keeping the smaller half in a negated max-heap (`_low`) and larger half in a min-heap (`_high`) while routing every insertion through `_low -> _high -> rebalance` guarantees the middle 1 or 2 values sit directly at the heap tops [src:python-tutorial].

## Common mistakes
- Forgetting to negate values pushed/popped from the lower half (since `heapq` is strictly a min-heap).
- Returning an `int` instead of `float` on odd lengths.

## Takeaways
- Negated values adapt Python's min-only `heapq` seamlessly into a max-heap.

## Related
P083, P088, lesson B8
