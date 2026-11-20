---
id: "b3-l1-iterators-generators"
moduleId: "b3-iterators-generators"
title: "Iteration Protocol, yield, Generators, and itertools"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Explain the difference between an iterable and an iterator (iter() and next())"
  - "Write memory-efficient generator functions using yield"
  - "Use generator expressions (x for x in ...) and itertools helpers"
prerequisites: ["b2-l1-classes-and-dataclasses"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["iterators", "generators", "yield", "itertools"]
---

## Concept

### 1. Iterables, Iterators, `iter()`, and `next()`

An **iterable** (like a `list`, `str`, or `dict`) can produce an **iterator** via `iter(obj)`, and an iterator produces one item at a time via `next(it)` until it raises `StopIteration` [src:python-tutorial].

```python
it = iter(["A", "B"])
print(next(it))  # A
print(next(it))  # B
# Calling next(it) again raises StopIteration
```

Explanation: Think of an iterable as a book, and an iterator as a bookmark moving forward one page at a time. `for` loops call `iter()` and `next()` automatically behind the scenes until `StopIteration`.

### 2. Generator Functions (`yield`)

A **generator function** uses `yield` instead of `return` [src:python-tutorial]. Each time `next()` is called, execution resumes right after the previous `yield`, computing values **lazily** on demand without storing the entire sequence in memory [src:python-tutorial].

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

print(list(countdown(3)))  # [3, 2, 1]
```

Explanation: Think of a `list` like downloading an entire movie before pressing play, whereas a generator (`yield`) is like streaming it one frame at a time.

### 3. Generator Expressions and `itertools`

A **generator expression** uses parentheses `(x * 2 for x in nums)` instead of brackets `[...]` [src:python-tutorial]. The `itertools` module provides fast building blocks such as `islice`, `chain`, and `groupby` [src:python-tutorial].

```python
from itertools import islice

squares = (x * x for x in range(1_000_000))  # uses almost zero memory
print(list(islice(squares, 4)))              # [0, 1, 4, 9]
```

Explanation: `islice(squares, 4)` pulls only the first 4 items from a million-item generator without computing the remaining 999,996.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

When processing large log files or database streams, generators let you filter and aggregate millions of rows using constant memory.

## Worked example

```python
from itertools import islice

def even_numbers():
    n = 0
    while True:
        yield n
        n += 2

first_four = list(islice(even_numbers(), 4))
print(first_four)  # [0, 2, 4, 6]
```

## Common mistakes

- **Reusing an exhausted generator**: Once a generator finishes, iterating over it a second time yields nothing; call the generator function again to create a fresh iterator [src:python-tutorial].

## Check your understanding

1. What exception signals that an iterator has no more items?
2. Why can a generator be looped over only once?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
