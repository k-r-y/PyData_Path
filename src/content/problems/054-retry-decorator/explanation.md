---
problemId: P054
solutions:
  - { file: solutions/reference.py, label: "Decorator factory with functools.wraps and bare raise", time: "O(k * fn)", space: "O(1)" }
---
## Approach
Explanation: A parameterized decorator has three nested scopes: `retry(...)` captures configuration, `decorator(fn)` captures the target callable, and `wrapper(*args, **kwargs)` runs each call inside the retry loop [src:python-tutorial]. Using a bare `raise` when `attempt + 1 >= max_attempts` preserves the original traceback cleanly [src:python-lang-ref].

## Common mistakes
- Catching all exceptions with `pass` on the last attempt and returning `None` silently instead of re-raising.
- Running `max_attempts + 1` calls (retrying `max_attempts` extra times rather than `max_attempts` total).
- Omitting `@functools.wraps(fn)`, overwriting `__name__` with `"wrapper"`.

## Takeaways
- Parameterized decorators add one extra outer factory layer around standard `def decorator(fn)`.

## Related
P055, P058, lesson B4
