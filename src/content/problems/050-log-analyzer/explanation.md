---
problemId: P050
solutions:
  - { file: solutions/reference.py, label: "Single-pass bounded split and Counter accumulation", time: "O(n)", space: "O(k)" }
---
## Approach
Explanation: Using `stripped.split(None, 3)` avoids splitting long multi-word log messages unnecessarily while cleanly extracting timestamp, level, and service name [src:python-stdtypes-docs]. Tracking failing services inside a `set` automatically deduplicates repeated errors before `sorted(...)` produces a deterministic list [src:python-tutorial].

## Common mistakes
- Collecting failing services in a list without deduplicating or sorting, returning duplicates like `['db', 'db']` or out-of-order lists.
- Including blank lines in `total`.

## Takeaways
- `str.split(None, maxsplit)` stops splitting once the leading structured columns are extracted.

## Related
P049, P098, lesson B9
