---
id: "a7-l1-comprehensions-and-builtins"
moduleId: "a7-comprehensions-builtins"
title: "Comprehensions and Essential Built-in Functions"
order: 1
estimatedMinutes: 22
difficulty: "beginner"
objectives:
  - "Transform and filter collections with list, dict, and set comprehensions"
  - "Iterate with indices and paired sequences using enumerate() and zip()"
  - "Sort records with sorted(..., key=lambda ...)"
  - "Use map(), filter(), any(), and all() cleanly"
prerequisites: ["a6-l1-lists-tuples-dicts-sets"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["comprehensions", "enumerate", "zip", "sorted", "lambda", "any", "all"]
---

## Concept

### 1. List, Dict, and Set Comprehensions

A **comprehension** builds a new collection in a single readable expression, optionally filtering with `if` [src:python-tutorial]:

```python
nums = [1, 2, 3, 4, 5]
evens_sq = [n ** 2 for n in nums if n % 2 == 0]         # list: [4, 16]
sq_map = {n: n ** 2 for n in nums if n <= 3}            # dict: {1: 1, 2: 4, 3: 9}
unique_mod = {n % 2 for n in nums}                      # set: {0, 1}
```

Explanation: Think of a comprehension as a compact assembly line: `[output for item in source if keep_condition]`. It replaces 4 lines of `result = []; for ...: result.append(...)` with one clear expression.

### 2. `enumerate()` and `zip()`

- `enumerate(seq, start=0)` yields `(index, item)` pairs so you never need `range(len(seq))` [src:python-tutorial].
- `zip(seq1, seq2)` pairs corresponding elements from multiple iterables, stopping at the shortest [src:python-tutorial].

```python
names = ["Ana", "Ben"]
scores = [91, 84]
for rank, (name, score) in enumerate(zip(names, scores), start=1):
    print(f"{rank}. {name}: {score}")
```

Explanation: `enumerate` attaches a running counter to each item, while `zip` zips two parallel lists together like teeth on a zipper.

### 3. `sorted()` and `lambda`

`sorted(iterable, key=..., reverse=False)` returns a **new** sorted list without mutating the original [src:python-tutorial]. A `lambda` is a small anonymous one-line function often passed as `key=` [src:python-tutorial].

```python
rows = [{"item": "Pen", "qty": 12}, {"item": "Hub", "qty": 3}]
by_qty = sorted(rows, key=lambda r: r["qty"], reverse=True)
print(by_qty[0]["item"])  # Pen
```

Explanation: `lambda r: r["qty"]` is just a quick inline helper meaning "given a row `r`, sort by `r['qty']`."

### 4. `any()`, `all()`, `map()`, and `filter()`

- `any(iterable)` returns `True` if at least one item is truthy; `all(iterable)` returns `True` only if every item is truthy [src:python-tutorial].
- `map(fn, seq)` and `filter(fn, seq)` lazily apply a function or predicate across an iterable (though comprehensions are often clearer in Python) [src:python-tutorial].

```python
scores = [85, 92, 78]
print("All passed (>=75):", all(s >= 75 for s in scores))  # True
print("Any 90+:", any(s >= 90 for s in scores))             # True
```

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
