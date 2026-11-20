---
id: "c11-l1-structured-eda"
moduleId: "c11-eda-workflow"
title: "Structured EDA Checklist and Profiling"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Execute a repeatable EDA checklist on a new dataset"
  - "Profile numeric and categorical columns separately"
  - "Document cleaning assumptions and hypotheses transparently"
prerequisites: ["c10-l1-inference-and-hypothesis-tests"]
packages: ["numpy", "pandas"]
sources: ["python-data-analysis", "pandas-docs"]
tags: ["eda", "profiling", "workflow"]
---

## Concept

### 1. Shape, Schema, and Missingness Audit

Start every Exploratory Data Analysis (EDA) by checking dimensions, column types, nulls, and duplicate rows [src:python-data-analysis]:

```python
import pandas as pd

df = pd.DataFrame({"region": ["North", "South", "North"], "units": [5, None, 8]})
print("Shape:", df.shape)
print("Nulls:\n", df.isna().sum())
```

Explanation: Think of EDA like inspecting a used car before a road trip: you check the tires, oil, and brakes systematically before driving onto the highway.

### 2. Univariate & Bivariate Profiling

Profile numeric columns with `df.describe()` and categorical columns with `df[col].value_counts(dropna=False)` [src:pandas-docs]. Then examine relationships across segments with `groupby()` or scatter/box plots.

```python
import pandas as pd

df = pd.DataFrame({"region": ["North", "South", "North"], "units": [5, 10, 8]})
print(df["region"].value_counts(dropna=False))
print(df.groupby("region")["units"].mean())
```

Explanation: Always pass `dropna=False` to `value_counts()` during EDA so missing categories are visible rather than silently hidden.

### 3. Decision Log

Record why rows were filtered or imputed so your team (and future you) can reproduce every number.

## Why it matters

Skipping structured EDA leads to missed data-entry quirks (like negative ages or test accounts) that invalidate downstream conclusions.

## Worked example

```python
import pandas as pd

df = pd.DataFrame({
    "region": ["North", "South", "North", "North"],
    "units": [5, 10, 8, 12],
})
print("Shape:", df.shape)
print("Region counts:\n", df["region"].value_counts())
```

## Common mistakes

- **Treating numeric IDs as continuous numbers**: `df.describe()` will compute the mean of `order_id` unless IDs are stored as strings [src:pandas-docs].

## Check your understanding

1. What method summarizes category frequencies in a pandas Series?
2. Complete the EDA profiling exercise on the right and try the checklist on **EDA & Capstone**.

## Sources

- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
- [src:pandas-docs] pandas Documentation (pandas development team)
