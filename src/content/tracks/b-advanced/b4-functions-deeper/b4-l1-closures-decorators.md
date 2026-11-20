---
id: "b4-l1-closures-decorators"
moduleId: "b4-functions-deeper"
title: "Closures, *args/**kwargs, and Decorators"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Accept variable numbers of arguments using *args and **kwargs"
  - "Explain how closures capture variables from an enclosing scope"
  - "Write a decorator using functools.wraps to preserve metadata"
prerequisites: ["b3-l1-iterators-generators"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["decorators", "closures", "args", "kwargs", "functools"]
---

## Concept

Functions in Python are first-class objects: they can be passed as arguments, returned from other functions, and assigned to variables [src:python-tutorial].

- `*args` collects extra positional arguments into a `tuple`, while `**kwargs` collects extra keyword arguments into a `dict` [src:python-tutorial].
- A **closure** is a nested function that remembers values from its enclosing function's scope even after the outer function returns [src:python-lang-ref].
- A **decorator** (`@my_decorator`) is a higher-order function that wraps another function to add behavior (such as logging or timing) without modifying its core code [src:python-lang-ref]. Always decorate the inner wrapper with `@functools.wraps(func)` so `__name__` and `__doc__` are preserved [src:python-tutorial].

Explanation: Think of a decorator as gift-wrapping a function: the wrapped function still does the exact same job inside, while the wrapper adds a ribbon (like timing or logging) before and after it runs.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Frameworks, data pipelines, and libraries use decorators (`@dataclass`, `@property`, `@lru_cache`) everywhere. Writing your own logging/timing decorator is a classic intermediate Python skill.

## Worked example

```python
import functools

def log_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@log_call
def add(a, b):
    return a + b

print(add(2, 3))
```

## Common mistakes

- **Forgetting `return func(*args, **kwargs)` inside `wrapper`**: Without `return`, the decorated function silently returns `None`!
- **Omitting `@functools.wraps(func)`**: Without it, `add.__name__` becomes `"wrapper"`, which confuses debugging and doc tools [src:python-tutorial].

## Check your understanding

1. What types do `args` and `kwargs` have inside `def f(*args, **kwargs):`?
2. Why is `@functools.wraps(func)` used inside decorators?
3. Complete the exercises on the right, including the Logging Decorator Toolkit mini-project.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
