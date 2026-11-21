---
problemId: P020
solutions:
  - { file: solutions/reference.py, label: "Single scan strict > length check", time: "O(n)", space: "O(n)" }
  - { file: solutions/alt-max.py, label: "Built-in max(words, key=len)", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Both a strict `len(word) > len(best)` comparison and Python's built-in `max(words, key=len)` return the first element encountered whenever multiple candidates share the maximum key [src:python-stdtypes-docs]. Splitting with `text.split()` returns `[]` safely on whitespace-only strings [src:python-tutorial].

## Common mistakes
- Writing `>=` instead of `>`, returning the last tied word instead of the first.
- Calling `max(text.split(), key=len)` directly without handling an empty sequence (`ValueError`).

## Takeaways
- Python's `max()` guarantees first-seen stability on key ties.

## Related
P009, P029, lesson A3
