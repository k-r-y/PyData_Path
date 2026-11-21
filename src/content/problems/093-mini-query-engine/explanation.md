---
problemId: P093
solutions:
  - { file: solutions/reference.py, label: "Predicate dispatch table + reverse-key stable Timsort", time: "O(k * N log N)", space: "O(N)" }
---
## Approach
Explanation: Mapping comparison operators in a lookup dictionary cleanly implements `where` conjunctions without unsafe `eval()` [src:python-tutorial]. Exploiting Timsort stability by sorting keys in `reversed(order_by)` order lets primary keys override ties regardless of mixed ascending/descending directions [src:python-stdtypes-docs].

## Common mistakes
- Iterating `order_by` forward instead of reversed, which lets secondary keys overwrite primary ordering.
- Mutating or sharing the caller's original row dictionaries during projection.

## Takeaways
- Python's guaranteed stable `list.sort` makes multi-column mixed-direction ordering trivial when keys are sorted least-significant first.

## Related
P063, P099, lesson A6
