---
id: "b4-l1-closures-decorators"
moduleId: "b4-functions-deeper"
title: "Closures, *args/**kwargs, and Decorators"
order: 1
estimatedMinutes: 22
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

### 1. Variadic Arguments: `*args` and `**kwargs`

Functions in Python can accept any number of positional arguments into a `tuple` (`*args`) and any number of keyword arguments into a `dict` (`**kwargs`) [src:python-tutorial].

```python
def summarize(*args, **kwargs):
    print("Positional:", args)
    print("Keyword:", kwargs)

summarize(10, 20, currency="USD", round_to=2)
```

Explanation: `*args` collects unnamed extra values into a tuple; `**kwargs` collects `name=value` pairs into a dictionary.

### 2. Closures and Higher-Order Functions

Functions are first-class objects: they can be passed as arguments and returned from other functions [src:python-tutorial]. A **closure** is a nested function that remembers variables from its enclosing function's scope even after the outer function finishes [src:python-lang-ref].

```python
def make_multiplier(factor):
    def multiply(x):
        return x * factor  # remembers 'factor'
    return multiply

times_3 = make_multiplier(3)
print(times_3(10))  # 30
```

Explanation: When `make_multiplier(3)` returns `multiply`, Python attaches the remembered `factor = 3` to `multiply` like a backpack.

### 3. Decorators and `@functools.wraps`

A **decorator** (`@my_decorator`) is a higher-order function that wraps another function to add behavior (such as logging or timing) without modifying its core code [src:python-lang-ref]. Always decorate the inner wrapper with `@functools.wraps(func)` so `__name__` and `__doc__` are preserved [src:python-tutorial].

```python
import functools

def shout(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return str(func(*args, **kwargs)).upper()
    return wrapper

@shout
def greet(name):
    return f"hello {name}"

print(greet("ana"), greet.__name__)  # HELLO ANA greet
```

Explanation: `@shout` above `def greet` is syntactic sugar for `greet = shout(greet)`. Using `*args, **kwargs` inside `wrapper` lets the decorator wrap functions with *any* signature.

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
