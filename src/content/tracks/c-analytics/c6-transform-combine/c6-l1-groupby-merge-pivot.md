---
id: "c6-l1-groupby-merge-pivot"
moduleId: "c6-transform-combine"
title: "groupby, merge, concat, and pivot_table"
order: 1
estimatedMinutes: 24
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

### 1. Split-Apply-Combine (`groupby` and `agg`)

`df.groupby("region")["sales"].agg(["sum", "mean", "count"])` splits rows into groups, applies aggregations, and combines results [src:pandas-docs].

```python
import pandas as pd

df = pd.DataFrame({"region": ["North", "North", "South"], "sales": [100, 50, 80]})
print(df.groupby("region")["sales"].agg(["sum", "mean"]))
```

Explanation: Think of `groupby` as sorting receipts into labeled folders (one per region) and computing totals for each folder.

### 2. Joining and Stacking (`pd.merge` and `pd.concat`)

- `pd.merge(orders, customers, on="cust_id", how="left")` joins tables on key columns like SQL `LEFT JOIN` [src:pandas-docs].
- `pd.concat([jan_df, feb_df], ignore_index=True)` stacks tables with matching columns vertically [src:pandas-docs].

```python
import pandas as pd

a = pd.DataFrame({"id": [1, 2], "val": [10, 20]})
b = pd.DataFrame({"id": [1], "tag": ["VIP"]})
print(pd.merge(a, b, on="id", how="left"))
```

### 3. Cross-Tabulation (`pivot_table`)

`df.pivot_table(index="region", columns="category", values="sales", aggfunc="sum", fill_value=0)` reshapes long data into a readable 2D summary matrix [src:pandas-docs].

```python
import pandas as pd

df = pd.DataFrame({
    "region": ["North", "North", "South"],
    "cat": ["Tech", "Office", "Tech"],
    "sales": [100, 40, 80],
})
print(df.pivot_table(index="region", columns="cat", values="sales", aggfunc="sum", fill_value=0))
```

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
