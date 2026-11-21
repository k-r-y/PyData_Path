---
problemId: P058
solutions:
  - { file: solutions/reference.py, label: "Class-based context manager with perf_counter and return False", time: "O(1)", space: "O(1)" }
---
## Approach
Explanation: Python's `with` statement guarantees calling `__exit__` whether the inner block completes normally or exits via an exception [src:python-tutorial]. Returning `False` (or `None`) tells Python to keep propagating any exception after `self.elapsed` has been recorded, whereas returning `True` silently swallows failures [src:python-lang-ref].

## Common mistakes
- Returning `True` from `__exit__`, which hides bugs and assertions raised inside the `with` block.
- Using `time.time()` instead of monotonic `time.perf_counter()` for short sub-millisecond elapsed spans.

## Takeaways
- Always return `False` from teardown/timing `__exit__` hooks unless your context manager is explicitly designed to handle exceptions.

## Related
P054, P045, lesson B5
