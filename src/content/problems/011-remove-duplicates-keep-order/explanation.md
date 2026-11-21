---
problemId: P011
solutions:
  - { file: solutions/reference.py, label: "Set of seen items", time: "O(n) average", space: "O(n)" }
  - { file: solutions/alt-fromkeys.py, label: "dict.fromkeys", time: "O(n) average", space: "O(n)" }
---
## Approach
Explanation: Scan left to right and keep a set of items already seen. Add an item to the result only the first time you meet it. Set membership checks are constant time on average [src:python-wiki-timecomplexity].

## Common mistakes
- Using `list(set(items))` alone. Sets do not guarantee original insertion order [src:python-stdtypes-docs].
- Checking `item not in result` on a list. It passes small tests, but each membership test scans the result list in `O(n)` time, causing `O(n^2)` behavior on large inputs [src:python-wiki-timecomplexity].
- Mutating the input list while iterating over it, which skips elements and violates the no-mutation requirement.

## Takeaways
- When you need to answer "seen before?" quickly, reach for a `set` or `dict`.
- Python dictionaries preserve insertion order as part of the language specification since Python 3.7, which is why `list(dict.fromkeys(items))` works in `O(n)` average time [src:python-stdtypes-docs].

## Related
P030, P062, lessons A6, A7, and B8
