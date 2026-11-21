---
problemId: P060
solutions:
  - { file: solutions/reference.py, label: "Tuple sort key with negated numeric column", time: "O(n log n)", space: "O(n)" }
---
## Approach
Explanation: Python compares tuples element by element from left to right [src:python-tutorial]. Negating the integer `-r["stock"]` reverses the middle criterion while leaving `category` and `sku` sorted ascending cleanly in a single `sorted()` call.

## Common mistakes
- Trying to reverse the whole sort with `reverse=True`, which flips `category` and `sku` too.

## Takeaways
- Tuple keys + sign negation mix ascending and descending criteria cleanly in Python's Timsort.

## Related
P031, P059, lesson A6
