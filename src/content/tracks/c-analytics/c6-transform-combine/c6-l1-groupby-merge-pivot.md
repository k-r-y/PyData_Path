---
id: "c6-l1-groupby-merge-pivot"
moduleId: "c6-transform-combine"
title: "groupby, merge, concat, and pivot_table"
order: 1
estimatedMinutes: 22
difficulty: "intermediate"
objectives:
  - "Summarize data by group using df.groupby(...).agg(...)"
  - "Join two DataFrames on key columns using pd.merge(how='inner'|'left')"
  - "Stack DataFrames vertically or horizontally with pd.concat()"
  - "Build cross-tabulated summaries with pd.pivot_table()"
prerequisites: ["c5-l1-cleaning-messy-data"]
packages: ["numpy", "pandas"]
sources: ["pandas-docs", "python-data-analysis"]
tags: ["groupby", "merge", "concat", "pivot_table"]
---

## Concept

Transforming and combining tables in `pandas` centers on four operations [src:pandas-docs]:
- **Split-Apply-Combine (`groupby`)**: `df.groupby("region")["sales"].agg(["sum", "mean", "count"])` [src:pandas-docs].
- **Relational Join (`pd.merge`)**: `pd.merge(orders, customers, on="cust_id", how="left")` works like SQL `LEFT JOIN` [src:pandas-docs].
- **Stacking (`pd.concat`)**: `pd.concat([jan_df, feb_df], ignore_index=True)` stacks tables with matching columns [src:pandas-docs].
- **Pivoting (`pivot_table`)**: `df.pivot_table(index="region", columns="category", values="sales", aggfunc="sum", fill_value=0)` [src:pandas-docs].

Explanation: Think of `groupby` as sorting receipts into labeled folders (one per region) and computing totals for each folder. `pd.merge` is like looking up customer names from a separate directory using `cust_id`.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Business questions ("total revenue per region and category", "combine monthly exports") almost always require `groupby`, `merge`, or `pivot_table`.

## Worked example

```python
import pandas as pd

sales = pd.DataFrame({
    "region": ["North", "North", "South"],
    "amount": [100, 50, 80],
})
summary = sales.groupby("region", as_index=False)["amount"].sum()
print(summary)
```

## Common mistakes

- **Duplicate keys in `pd.merge`**: If both tables have duplicate keys, `merge` creates a Cartesian product (row explosion). Always verify row counts before and after merging [src:pandas-docs].

## Check your understanding

1. What does `how="left"` do in `pd.merge(a, b, on="id", how="left")`?
2. When do you use `pd.concat` vs `pd.merge`?
3. Complete the exercises on the right, including the Sales Performance Analysis mini-project.

## Sources

- [src:pandas-docs] pandas Documentation (pandas development team)
- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
