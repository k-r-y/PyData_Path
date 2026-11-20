---
id: "c11-l1-structured-eda"
moduleId: "c11-eda-workflow"
title: "Structured EDA Checklist and Profiling"
order: 1
estimatedMinutes: 18
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

Exploratory Data Analysis (EDA) is a structured investigation before modeling or reporting [src:python-data-analysis]:
1. **Shape & Schema**: `df.shape`, `df.dtypes`, `df.head()`.
2. **Missingness & Duplicates**: `df.isna().sum()`, `df.duplicated().sum()`.
3. **Univariate Checks**: `df.describe()` for numeric columns; `df[col].value_counts()` for categorical columns [src:pandas-docs].
4. **Bivariate Checks**: Group summaries (`groupby`) and scatter/box plots across segments.
5. **Decision Log**: Record why rows were filtered or imputed so results are reproducible.

Explanation: Think of EDA like inspecting a used car before a road trip: you check the tires, oil, and brakes systematically before driving onto the highway.

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
