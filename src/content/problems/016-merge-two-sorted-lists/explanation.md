---
problemId: P016
solutions:
  - { file: solutions/reference.py, label: "Two-pointer linear merge", time: "O(n + m)", space: "O(n + m)" }
---
## Approach
Explanation: Compare the smallest unconsumed items `a[i]` and `b[j]`, append the smaller, and advance that pointer [src:python-tutorial]. When the `while` loop finishes, `out.extend(a[i:])` and `out.extend(b[j:])` flush the leftover tail cleanly in `O(n + m)` total work [src:python-wiki-timecomplexity].

## Common mistakes
- Forgetting to append the leftover tail after one pointer reaches the end.
- Calling `b.pop(0)` repeatedly inside a loop, turning an O(n) merge into O(n^2) due to list shifting.

## Takeaways
- Two-pointer merging is the linear building block behind Merge Sort.

## Related
P036, P042, lesson B8
