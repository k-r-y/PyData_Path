---
id: "c3-l1-numpy-arrays-vectorization"
moduleId: "c3-numpy"
title: "NumPy Arrays, Broadcasting, and Vectorization"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Create NumPy ndarrays and inspect .shape and .dtype"
  - "Index, slice, and boolean-mask NumPy arrays"
  - "Replace Python loops with vectorized operations and broadcasting"
  - "Compute array aggregations (mean, sum, std, axis=0/1)"
prerequisites: ["c2-l1-sql-and-sqlite3"]
packages: ["numpy"]
sources: ["numpy-docs", "python-ds-handbook"]
tags: ["numpy", "ndarray", "vectorization", "broadcasting"]
---

## Concept

NumPy's `ndarray` stores homogeneous numeric data in contiguous memory, making element-wise math orders of magnitude faster than Python `for` loops [src:numpy-docs].

- **Attributes**: `arr.shape` (dimensions tuple), `arr.dtype` (element type like `int64` or `float64`) [src:numpy-docs].
- **Vectorization**: `prices * 1.12` multiplies every element in C without writing a Python loop [src:numpy-docs].
- **Broadcasting**: Operating on arrays of compatible shapes (such as adding a 1D array of column offsets to a 2D matrix) [src:numpy-docs].
- **Boolean masking**: `arr[arr > 10]` selects only elements matching the condition [src:numpy-docs].
- **Aggregations**: `arr.mean()`, `arr.sum()`, `arr.std()`, and `axis=0` (down rows, per column) vs `axis=1` (across columns, per row) [src:numpy-docs].

Explanation: Think of a Python `list` as a row of separate gift boxes scattered around a room, whereas a NumPy `ndarray` is a tightly packed egg carton of identical slots. Vectorization lets the CPU process the whole carton at once.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

`pandas`, `SciPy`, and `scikit-learn` are all built on top of NumPy arrays.

## Worked example

```python
import numpy as np

prices = np.array([100.0, 45.0, 220.0, 80.0])
discounted = prices * 0.90
high = discounted[discounted >= 90]
print("High discounted:", high, "Mean:", high.mean())
```

## Common mistakes

- **Using Python `and`/`or` on NumPy boolean arrays**: Use bitwise `&`, `|`, and `~` with parentheses (for example, `(arr > 10) & (arr < 50)`), because Python's `and` tries to evaluate the whole array as one boolean [src:numpy-docs].

## Check your understanding

1. What does `arr.shape` tell you?
2. Why do you write `(arr > 10) & (arr < 50)` instead of `arr > 10 and arr < 50` in NumPy?
3. Complete the exercises on the right.

## Sources

- [src:numpy-docs] NumPy Documentation (NumPy community)
- [src:python-ds-handbook] Python Data Science Handbook (Jake VanderPlas)
