---
id: "b8-l1-big-o-and-timeit"
moduleId: "b8-performance-algorithms"
title: "Big-O Intuition, Data Structure Choice, and timeit"
order: 1
estimatedMinutes: 16
difficulty: "intermediate"
objectives:
  - "Compare O(1) hash lookup (set/dict) vs O(n) linear scan (list)"
  - "Measure execution time of small snippets using timeit"
  - "Identify nested loops that cause O(n^2) slowdowns on large datasets"
prerequisites: ["b7-l1-testing-and-debugging"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["performance", "big-o", "timeit", "set", "dict"]
---

## Concept

Big-O notation describes how runtime grows as input size `n` increases [src:python-tutorial]:
- **O(1) constant time**: `key in my_dict` or `item in my_set` uses a hash table, staying fast regardless of size.
- **O(n) linear time**: `item in my_list` scans elements one by one from left to right.
- **O(n log n)**: `sorted(items)` (Timsort).
- **O(n^2) quadratic time**: A loop inside a loop scanning a list for every row.

You can time small Python expressions using the standard library's `timeit` module [src:python-tutorial].

Explanation: Looking up a student ID in a `list` is like reading every page of a phone book from page 1 (`O(n)`). Putting those IDs into a `set` or `dict` is like jumping straight to the exact tab (`O(1)`).

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Checking `if user_id in seen_list:` inside a loop over 50,000 rows takes seconds or minutes, while `if user_id in seen_set:` finishes in milliseconds.

## Worked example

```python
import timeit

items_list = list(range(5000))
items_set = set(items_list)

t_list = timeit.timeit(lambda: 4999 in items_list, number=200)
t_set = timeit.timeit(lambda: 4999 in items_set, number=200)
print(f"list: {t_list:.5f}s | set: {t_set:.5f}s")
```

## Common mistakes

- **Premature micro-optimization**: Choose the right algorithm and data structure (`set`/`dict` for membership) first, and measure with `timeit` before rewriting readable code [src:pep20].

## Check your understanding

1. What is the time complexity of `x in my_set` vs `x in my_list`?
2. Which standard library module benchmarks small Python snippets?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep20] PEP 20 - The Zen of Python (Tim Peters)
