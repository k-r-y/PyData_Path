---
problemId: P011
solutions:
  - { file: solutions/brute-force.py, label: "Brute force", time: "O(n^2)", space: "O(n)" }
  - { file: solutions/reference.py, label: "Set of seen items", time: "O(n) average", space: "O(n)" }
  - { file: solutions/alt-fromkeys.py, label: "dict.fromkeys", time: "O(n) average", space: "O(n)" }
---
## Approach
Explanation: Scan left to right and keep a set of items already seen. Add an item to the result only the first time you meet it. Set membership checks are constant time on average [src:python-wiki-timecomplexity].

## Common mistakes
- Using `set(items)` alone. Sets do not keep your original order.
- Checking `item not in result` on a list. It works, but each check scans the list, so large inputs become slow.
- Removing items from the list you are looping over, which changes the input and skips elements.

## Takeaways
- When you need to answer "seen before?", reach for a set or dict.
- Dicts keep insertion order as part of the language since Python 3.7, which is why `dict.fromkeys` works [src:python-stdtypes-docs].

## Related
P062, P015, lessons A6 and A7