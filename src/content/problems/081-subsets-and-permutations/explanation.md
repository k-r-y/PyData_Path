---
problemId: P081
solutions:
  - { file: solutions/reference.py, label: "Sorted backtracking with path copies", time: "O(n * 2^n) / O(n * n!)", space: "O(n)" }
---
## Approach
Explanation: Sorting a copy `arr = sorted(nums)` first turns standard DFS order directly into lexicographical order without needing a post-sort step [src:python-tutorial]. Copying `list(path)` before pushing into `out` is essential because mutating `path` later via `.append()` / `.pop()` would overwrite previously recorded lists if stored by reference [src:think-python].

## Common mistakes
- Writing `out.append(path)` instead of `out.append(list(path))`, producing a list of identical empty `[]` references after backtracking unwinds!
- Allowing `all_subsets([1, 2])` to drop `[]` or fail lexicographical order.

## Takeaways
- Always append `list(path)` (a shallow snapshot copy) when collecting backtracking states.

## Related
P080, P082, lesson A5
