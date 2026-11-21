---
problemId: P031
solutions:
  - { file: solutions/reference.py, label: "Counter plus negated count tuple sort", time: "O(n + u log u)", space: "O(u)" }
---
## Approach
Explanation: Passing `reverse=True` to `sorted` flips BOTH the frequency count AND alphabetical tie-breaking! Instead, negate only the numeric frequency `(-count, word)` while leaving `reverse=False` so counts sort descending and ties sort A-to-Z ascending [src:python-tutorial]. Note that `Counter` counts all tokens in linear `O(n)` time before sorting only the `u` unique entries [src:python-lang-ref].

## Common mistakes
- Using `reverse=True` directly on `(count, word)`, which wrongly picks `"z"` ahead of `"a"` on ties.
- Calling `Counter(words).most_common(k)`, which breaks ties by first insertion order rather than alphabetically.

## Takeaways
- Negate numeric sort keys `(-score, name)` instead of `reverse=True` whenever mixed ascending/descending directions are required.

## Related
P060, P032, lessons A6 and B8
