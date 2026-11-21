---
problemId: P055
solutions:
  - { file: solutions/reference.py, label: "Closure-scoped dict keyed by (args, sorted kwargs)", time: "O(1) lookup", space: "O(k)" }
---
## Approach
Explanation: Defining `cache = {}` inside `memoize(fn)` creates a private dictionary per decorated function closure [src:python-tutorial]. Checking `key not in cache` guarantees `None` or `False` return values are cached properly without re-executing the function, and `tuple(sorted(kwargs.items()))` makes dictionaries hashable [src:python-lang-ref].

## Common mistakes
- Sharing a module-level `cache = {}` across all decorated functions, causing cross-function key collisions.
- Checking `if cache.get(key) is None:`, which treats cached `None` returns as permanent misses.

## Takeaways
- Closure variables give each decorated function isolated persistent state cleanly.

## Related
P054, P072, lesson B4
