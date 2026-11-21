When calling unreliable external APIs, transient network errors can often succeed on a quick retry.

Implement a parameterized decorator factory `retry(max_attempts: int = 3, exceptions=(Exception,))`:
- Calls the decorated function up to `max_attempts` total attempts.
- Retries only when an exception matching `exceptions` is raised; immediately propagates unrelated exceptions.
- Re-raises the last matching exception if all attempts fail.
- Preserves the wrapped function's `__name__` and metadata via `functools.wraps`.
