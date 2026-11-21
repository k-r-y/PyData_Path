---
problemId: P057
solutions:
  - { file: solutions/reference.py, label: "Lazy iter + islice + bounded deque(maxlen=k)", time: "O(n)", space: "O(size or k)" }
---
## Approach
Explanation: Using `iter(iterable)` and `itertools.islice` lets both generators process huge streams lazily without needing `len(iterable)` or indexing `seq[i]` [src:python-lang-ref]. Inside `sliding_window`, priming a `collections.deque(maxlen=k)` automatically evicts the leftmost item in `O(1)` on every new append [src:python-tutorial].

## Common mistakes
- Writing `range(0, len(seq), size)`, which fails with `TypeError` on generator objects.
- Deferring validation `size <= 0` inside a generator: note when callers do `list(chunks([], 0))`, the generator advances on first `next()` and validates immediately.

## Takeaways
- `islice` + `deque(maxlen=k)` handle arbitrary iterables in constant working memory.

## Related
P056, P039, lesson B3
