---
problemId: P035
solutions:
  - { file: solutions/reference.py, label: "Recursive isinstance(item, list) flattening", time: "O(n)", space: "O(n)" }
  - { file: solutions/alt-iterative.py, label: "Iterative explicit stack", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Testing `isinstance(item, list)` separates inner lists from scalar and string leaves cleanly [src:python-tutorial]. Each list node recurses down and appends leaf values into a shared accumulator, while an explicit stack avoids recursion depth limits if nesting exceeds Python's call stack [src:think-python].

## Common mistakes
- Writing only a single `for sublist in nested: for x in sublist:` pass that breaks on depth >= 3.
- Testing `hasattr(item, "__iter__")`, which mistakenly explodes strings like `"abc"` into `["a", "b", "c"]`.

## Takeaways
- Use `isinstance(x, list)` instead of `Iterable` when strings should stay whole values.

## Related
P068, P056, lesson A5
