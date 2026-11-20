---
id: "c4-l1-series-dataframe-selection"
moduleId: "c4-pandas-basics"
title: "Series, DataFrame, loc/iloc, Filtering, and Summaries"
order: 1
estimatedMinutes: 22
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

`pandas` provides two core tabular structures [src:pandas-docs]:
- `Series`: A 1D labeled array (like a single column).
- `DataFrame`: A 2D labeled table with rows and named columns.

### Inspection, Selection, and Filtering

- `df.head()`, `df.info()`, `df.describe()`: Quick structure and summary checks [src:pandas-docs].
- `df.loc[row_label, col_label]`: **Label-based** selection (inclusive of slice stop!) [src:pandas-docs].
- `df.iloc[row_pos, col_pos]`: **Integer position-based** selection (exclusive of slice stop, like Python lists) [src:pandas-docs].
- Filtering: `df[df["units"] >= 5]` or `df.loc[df["region"] == "North", ["item", "units"]]` [src:pandas-docs].
- Sorting: `df.sort_values("units", ascending=False)` [src:pandas-docs].

Explanation: Remember `loc` = **L**abel, `iloc` = **I**nteger position. When assigning new values to a filtered subset, always use `df.loc[mask, "col"] = val` instead of `df[mask]["col"] = val` to avoid modifying a temporary copy.

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
