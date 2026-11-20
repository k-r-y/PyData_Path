---
id: "a7-l1-comprehensions-and-builtins"
moduleId: "a7-comprehensions-builtins"
title: "Comprehensions and Essential Built-in Functions"
order: 1
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Transform and filter collections with list, dict, and set comprehensions"
  - "Iterate with indices and paired sequences using enumerate() and zip()"
  - "Sort records with sorted(..., key=lambda ...)"
  - "Check sequence conditions using any() and all()"
prerequisites: ["a6-l1-lists-tuples-dicts-sets"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["comprehensions", "enumerate", "zip", "sorted", "lambda", "any", "all"]
---

## Concept

A **comprehension** builds a new list, dictionary, or set in a single readable expression [src:python-tutorial]:
- List: `[x * 2 for x in nums if x > 0]`
- Dict: `{k: v * 1.12 for k, v in prices.items()}`
- Set: `{row["dept"] for row in records}`

Python also provides functional built-ins that eliminate manual index counters [src:python-tutorial]:
- `enumerate(seq, start=0)`: Yields `(index, item)` pairs.
- `zip(seq1, seq2)`: Pairs corresponding elements from two or more sequences (stops at the shortest).
- `sorted(iterable, key=..., reverse=False)`: Returns a new sorted list; `key` accepts a function such as `lambda r: r["score"]`.
- `any(iterable)` / `all(iterable)`: Return `True` if any (or all) elements are truthy.
- `map(fn, seq)` / `filter(fn, seq)`: Lazily transform or filter items (often written as comprehensions in idiomatic Python) [src:python-tutorial].

Explanation: Think of `enumerate` and `zip` as zippers that align items cleanly without `range(len(items))`, and a comprehension as a compact assembly line that filters and transforms in one pass.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Data cleaning scripts constantly pair column names with row values (`zip`), rank records by a metric (`sorted` with `lambda`), and filter valid entries with comprehensions.

## Worked example

```python
names = ["Ana", "Ben", "Cara"]
scores = [91, 78, 95]

passed = [name for name, s in zip(names, scores) if s >= 80]
ranked = sorted(zip(names, scores), key=lambda pair: pair[1], reverse=True)

print("Passed:", passed)
print("Top student:", ranked[0][0])
```

## Common mistakes

- **Using `list.sort()` when you needed `sorted()`**: `items.sort()` mutates the list in place and returns `None`; `sorted(items)` returns a new sorted list [src:python-tutorial].
- **Over-nesting comprehensions**: If a comprehension needs more than two `for` clauses or complex logic, a standard `for` loop is easier to read [src:pep8].

## Check your understanding

1. What is the difference between `items.sort()` and `sorted(items)`?
2. How does `zip(["a", "b"], [1, 2, 3])` behave when lengths differ?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
