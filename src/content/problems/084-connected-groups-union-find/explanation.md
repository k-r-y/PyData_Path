---
problemId: P084
solutions:
  - { file: solutions/reference.py, label: "Iterative path halving + union by rank", time: "O(alpha(n)) amortized", space: "O(n)" }
---
## Approach
Explanation: Storing parent pointers alongside rank avoids scanning or relabeling all `n` items on every `union` [src:python-wiki-timecomplexity]. Iterative path halving inside `find` flattens chains dynamically without recursive stack overflow even on 10,000-node lines [src:python-tutorial].

## Common mistakes
- Relabeling every element in an array during `union`, taking `O(n)` per merge (`O(n^2)` total).
- Decrementing `self.count` even when `a` and `b` already belong to the same set.

## Takeaways
- Path compression + union by rank gives virtually constant-time dynamic connectivity queries.

## Related
P063, P079, lesson B2
