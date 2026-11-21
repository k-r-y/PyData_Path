Implement a context manager class `Timer(label: str = "")` that records execution duration inside `self.elapsed`.

Requirements:
- Initialize `self.elapsed = 0.0` and `self.label = label`.
- `__enter__` captures start timestamp with `time.perf_counter()` and returns `self`.
- `__exit__` computes `self.elapsed = time.perf_counter() - start` cleanly even if an exception occurs inside the `with` block, and **never suppresses exceptions** (return `False`).
