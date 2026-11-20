---
id: "c3-l1-numpy-arrays-vectorization"
moduleId: "c3-numpy"
title: "NumPy Arrays, Broadcasting, and Vectorization"
order: 1
estimatedMinutes: 22
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

### 1. Creating Arrays, `.shape`, and `.dtype`

NumPy's `ndarray` stores homogeneous numeric data in contiguous memory [src:numpy-docs]. Every array has a `.shape` (dimensions tuple) and `.dtype` (element type like `int64` or `float64`) [src:numpy-docs].

```python
import numpy as np

grid = np.array([[10, 20, 30], [40, 50, 60]])
print("Shape:", grid.shape, "Dtype:", grid.dtype)  # (2, 3) int64
```

Explanation: Think of a Python `list` as a row of separate gift boxes scattered around a room, whereas a NumPy `ndarray` is a tightly packed egg carton of identical slots.

### 2. Indexing, Slicing, and Boolean Masking

You can slice 1D and 2D arrays (`grid[:, 1]` for column 1) or filter with boolean masks (`arr[(arr > 10) & (arr < 50)]`) [src:numpy-docs].

```python
import numpy as np

scores = np.array([65, 82, 91, 74, 88])
passing = scores[scores >= 75]
print("Passing:", passing)  # [82 91 88]
```

Explanation: Use `&` (and), `|` (or), and `~` (not) with parentheses when combining NumPy masks, because Python's `and` keyword expects a single boolean, not an array of booleans.

### 3. Vectorization, Broadcasting, and Axis Aggregations

- **Vectorization**: `prices * 1.12` multiplies every element in C without writing a Python `for` loop [src:numpy-docs].
- **Broadcasting**: NumPy automatically stretches smaller compatible shapes (e.g., adding a 1D array of 3 bonuses to a `(2, 3)` matrix) [src:numpy-docs].
- **Aggregations**: `arr.mean()`, `arr.sum()`, `arr.std()`, using `axis=0` (down rows, per column) or `axis=1` (across columns, per row) [src:numpy-docs].

```python
import numpy as np

matrix = np.array([[10, 20], [30, 40]])
print("Col means (axis=0):", matrix.mean(axis=0))  # [20. 30.]
print("Row means (axis=1):", matrix.mean(axis=1))  # [15. 35.]
```

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

- **Using Python `and`/`or` on NumPy boolean arrays**: Use bitwise `&`, `|`, and `~` with parentheses (for example, `(arr > 10) & (arr < 50)`) [src:numpy-docs].

## Check your understanding

1. What does `arr.shape` tell you?
2. Why do you write `(arr > 10) & (arr < 50)` instead of `arr > 10 and arr < 50` in NumPy?
3. Complete the exercises on the right.

## Sources

- [src:numpy-docs] NumPy Documentation (NumPy community)
- [src:python-ds-handbook] Python Data Science Handbook (Jake VanderPlas)
