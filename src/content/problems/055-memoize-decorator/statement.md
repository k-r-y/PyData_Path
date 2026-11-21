Write a decorator `memoize(fn)` (without `functools.lru_cache`) that caches results per decorated function based on both positional `args` and keyword `kwargs`.

Requirements:
- Maintain a separate cache dictionary per decorated function.
- Properly cache `None` and `False` return values (check key membership with `in`, not truthiness).
- Preserve wrapped metadata via `functools.wraps`.
