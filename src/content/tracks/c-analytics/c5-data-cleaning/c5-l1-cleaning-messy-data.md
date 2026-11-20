---
id: "c5-l1-cleaning-messy-data"
moduleId: "c5-data-cleaning"
title: "Missing Values, Duplicates, Strings, and Type Cleaning"
order: 1
estimatedMinutes: 22
difficulty: "intermediate"
objectives:
  - "Detect and handle missing values with isna(), dropna(), and fillna()"
  - "Remove duplicate records with drop_duplicates()"
  - "Clean string columns with .str accessor and parse numbers/dates safely"
prerequisites: ["c4-l1-series-dataframe-selection"]
packages: ["numpy", "pandas"]
sources: ["pandas-docs", "python-data-analysis"]
tags: ["data-cleaning", "missing-values", "duplicates", "str-accessor"]
---

## Concept

Real-world tables rarely arrive clean. `pandas` provides dedicated tools for each cleaning step [src:pandas-docs]:
- **Missing values**: `df.isna().sum()` counts nulls per column; `df.dropna(subset=["col"])` drops rows missing critical fields; `df["col"].fillna(0)` imputes defaults [src:pandas-docs].
- **Duplicates**: `df.duplicated().sum()` counts exact duplicates; `df.drop_duplicates(subset=["order_id"])` keeps unique records [src:pandas-docs].
- **Strings**: `df["dept"].str.strip().str.upper()` standardizes messy text across a whole column [src:pandas-docs].
- **Types**: `pd.to_numeric(df["price"], errors="coerce")` turns unparseable strings like `"N/A"` into `NaN`; `pd.to_datetime(df["date"], errors="coerce")` parses dates [src:pandas-docs].

Explanation: Never drop missing rows blindly! First ask *why* a value is missing: a missing `coupon_code` usually means "no coupon" (`fillna("")`), whereas a missing `order_total` might require dropping or investigating the row.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Clean data is the foundation of trustworthy analytics; garbage in produces misleading summaries.

## Worked example

```python
import pandas as pd

df = pd.DataFrame({
    "dept": [" is ", "IS", "cs "],
    "score": ["90", "N/A", "85"],
})
df["dept"] = df["dept"].str.strip().str.upper()
df["score"] = pd.to_numeric(df["score"], errors="coerce")
print(df)
```

## Common mistakes

- **Using `.str` on non-string columns**: Calling `df["col"].str.strip()` fails if the column has numeric dtype; convert with `.astype(str)` only when appropriate [src:pandas-docs].

## Check your understanding

1. What does `errors="coerce"` do in `pd.to_numeric()`?
2. Why should you inspect `df.isna().sum()` before calling `dropna()`?
3. Complete the exercises on the right.

## Sources

- [src:pandas-docs] pandas Documentation (pandas development team)
- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
