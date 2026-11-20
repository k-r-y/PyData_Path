---
id: "c4-l1-series-dataframe-selection"
moduleId: "c4-pandas-basics"
title: "Series, DataFrame, loc/iloc, Filtering, and Summaries"
order: 1
estimatedMinutes: 24
difficulty: "intermediate"
objectives:
  - "Distinguish a 1D pandas Series from a 2D DataFrame"
  - "Inspect DataFrames with head(), info(), shape, and describe()"
  - "Select subsets cleanly with loc (label-based) and iloc (integer position-based)"
  - "Filter and sort DataFrames without chained-assignment warnings"
prerequisites: ["c3-l1-numpy-arrays-vectorization"]
packages: ["numpy", "pandas"]
sources: ["pandas-docs", "python-data-analysis"]
tags: ["pandas", "dataframe", "series", "loc", "iloc"]
---

## Concept

### 1. `Series` vs `DataFrame` and First Inspection

`pandas` provides two core tabular structures [src:pandas-docs]:
- `Series`: A 1D labeled array (like a single column).
- `DataFrame`: A 2D labeled table with rows and named columns.

Inspect any new table immediately with `df.head()`, `df.info()`, `df.shape`, and `df.describe()` [src:pandas-docs].

```python
import pandas as pd

df = pd.DataFrame({"item": ["Hub", "Mouse"], "units": [3, 5]})
print(df.shape)
print(df.describe())
```

Explanation: Think of a `DataFrame` as a dictionary of aligned `Series` columns sharing the same row index.

### 2. `loc` (Label-Based) vs `iloc` (Integer Position-Based)

- `df.loc[row_label, col_label]`: **Label-based** selection (slice stop is inclusive!) [src:pandas-docs].
- `df.iloc[row_pos, col_pos]`: **Integer position-based** selection (slice stop is exclusive, like Python lists) [src:pandas-docs].

```python
import pandas as pd

df = pd.DataFrame({"units": [3, 5, 12]}, index=["a", "b", "c"])
print(df.loc["a":"b", "units"].tolist())  # [3, 5] (includes 'b')
print(df.iloc[0:2, 0].tolist())           # [3, 5] (excludes position 2)
```

Explanation: Remember `loc` = **L**abel, `iloc` = **I**nteger position.

### 3. Boolean Filtering and Sorting

Filter rows with boolean masks (`df[df["units"] >= 5]`) and sort with `df.sort_values("units", ascending=False)` [src:pandas-docs]. When assigning values to a filtered subset, always use `df.loc[mask, "col"] = val` instead of `df[mask]["col"] = val`.

```python
import pandas as pd

df = pd.DataFrame({"item": ["Hub", "Mouse", "Pen"], "units": [3, 5, 12]})
top = df[df["units"] >= 5].sort_values("units", ascending=False)
print(top)
```

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

`pandas` is the workhorse of Python data analytics for loading, slicing, and summarizing CSV and database tables.

## Worked example

```python
import pandas as pd

df = pd.DataFrame({
    "item": ["Hub", "Mouse", "Pen"],
    "units": [3, 5, 12],
    "price": [24.5, 18.0, 2.0],
})
df["revenue"] = df["units"] * df["price"]
top = df.sort_values("revenue", ascending=False)
print(top)
```

## Common mistakes

- **Confusing `loc` and `iloc` slice bounds**: `df.loc[0:2]` includes row label `2`, whereas `df.iloc[0:2]` excludes position `2` [src:pandas-docs].

## Check your understanding

1. What is the difference between `loc` and `iloc`?
2. Why should you use `df.loc[mask, "col"] = val` instead of `df[mask]["col"] = val`?
3. Complete the exercises on the right and explore datasets in the **DataFrame Lab**!

## Sources

- [src:pandas-docs] pandas Documentation (pandas development team)
- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
