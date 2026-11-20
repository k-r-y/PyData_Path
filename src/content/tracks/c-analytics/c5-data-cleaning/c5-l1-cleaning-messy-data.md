---
id: "c5-l1-cleaning-messy-data"
moduleId: "c5-data-cleaning"
title: "Missing Values, Duplicates, Strings, and Type Cleaning"
order: 1
estimatedMinutes: 24
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

### 1. Missing Values (`isna`, `dropna`, `fillna`)

`df.isna().sum()` counts nulls per column; `df.dropna(subset=["col"])` drops rows missing critical fields; `df["col"].fillna(0)` imputes defaults [src:pandas-docs].

```python
import pandas as pd

df = pd.DataFrame({"price": [10.0, None, 25.0]})
print("Null count:", int(df["price"].isna().sum()))
print("Filled:", df["price"].fillna(df["price"].median()).tolist())
```

Explanation: Never drop missing rows blindly! First ask *why* a value is missing: a missing `coupon_code` means "no coupon" (`fillna("")`), whereas a missing `order_total` might need dropping or investigation.

### 2. Duplicates (`duplicated`, `drop_duplicates`)

`df.duplicated().sum()` counts exact duplicate rows; `df.drop_duplicates(subset=["order_id"])` keeps unique records [src:pandas-docs].

```python
import pandas as pd

df = pd.DataFrame({"order_id": [1, 1, 2], "amount": [50, 50, 80]})
print("Unique orders:", len(df.drop_duplicates(subset=["order_id"])))
```

### 3. String Cleaning (`.str`) and Safe Type Parsing

Use `df["dept"].str.strip().str.upper()` to standardize text across a column, and `pd.to_numeric(df["price"], errors="coerce")` / `pd.to_datetime(..., errors="coerce")` to turn unparseable strings like `"N/A"` into `NaN` / `NaT` [src:pandas-docs].

```python
import pandas as pd

s = pd.Series(["10", "N/A", "25"])
print(pd.to_numeric(s, errors="coerce").tolist())  # [10.0, nan, 25.0]
```

Explanation: Standardize strings *before* calling `drop_duplicates`, otherwise `" is "` and `"IS"` will be treated as two different values.

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
