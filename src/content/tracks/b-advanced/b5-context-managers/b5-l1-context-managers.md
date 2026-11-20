---
id: "b5-l1-context-managers"
moduleId: "b5-context-managers"
title: "Context Managers (__enter__, __exit__, contextlib)"
order: 1
estimatedMinutes: 18
difficulty: "intermediate"
objectives:
  - "Explain the context manager protocol (__enter__ and __exit__)"
  - "Build a custom context manager using @contextlib.contextmanager"
  - "Ensure cleanup runs even when exceptions occur inside with"
prerequisites: ["b4-l1-closures-decorators"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["context-managers", "with", "contextlib"]
---

## Concept

### 1. The Context Manager Protocol (`__enter__` and `__exit__`)

A **context manager** guarantees setup and teardown around a `with` block [src:python-lang-ref]. Python calls `__enter__()` when entering `with`, binds its return value to `as var`, and always calls `__exit__(exc_type, exc_val, exc_tb)` when leaving the block, even if an exception occurred [src:python-lang-ref].

```python
class TimerSession:
    def __enter__(self):
        print("Session started")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Session closed")
        return False  # propagate any exception

with TimerSession():
    print("Running query")
```

Explanation: Returning `False` (or `None`) from `__exit__` ensures real exceptions are not silently swallowed; cleanup still runs, and then the exception continues normally.

### 2. Generator-Based Context Managers (`@contextlib.contextmanager`)

Instead of writing a full class, `contextlib.contextmanager` lets you write a generator function with a single `yield` wrapped in `try / finally` [src:python-tutorial].

```python
from contextlib import contextmanager

@contextmanager
def open_section(title):
    print(f"=== {title} ===")
    try:
        yield
    finally:
        print(f"=== END {title} ===")

with open_section("Summary"):
    print("Revenue: $1,200")
```

Explanation: Think of `try ... finally` inside `@contextmanager` as hotel check-in and automatic checkout: whatever happens during the stay (inside `yield`), the `finally` cleanup always runs on exit.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Database connections, file handles, temporary state changes, and locks must always be released cleanly even when an analytics job fails partway through.

## Worked example

```python
from contextlib import contextmanager

@contextmanager
def tag_block(name):
    print(f"<{name}>")
    try:
        yield
    finally:
        print(f"</{name}>")

with tag_block("report"):
    print("Sales summary")
```

## Common mistakes

- **Omitting `try / finally` around `yield` in `@contextmanager`**: Without `try / finally`, an exception inside the `with` block skips the cleanup lines after `yield` [src:python-tutorial].

## Check your understanding

1. Which two dunder methods define a class-based context manager?
2. Why is `try / finally` important around `yield` in `@contextmanager`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
