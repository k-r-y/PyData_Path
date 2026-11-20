---
id: "c7-l1-datetime-resampling-rolling"
moduleId: "c7-time-series"
title: "DatetimeIndex, Resampling, and Rolling Windows"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Convert date strings to datetime64 and set a DatetimeIndex"
  - "Aggregate time series by month or week using .resample()"
  - "Smooth noisy daily trends using .rolling(window).mean()"
prerequisites: ["c6-l1-groupby-merge-pivot"]
packages: ["numpy", "pandas"]
sources: ["pandas-docs", "python-data-analysis"]
tags: ["time-series", "datetime", "resample", "rolling"]
---

## Concept

### 1. Parsing Dates and `DatetimeIndex`

Convert string columns with `pd.to_datetime(df["date"])`, sort chronologically, and set the date column as the index [src:pandas-docs].

```python
import pandas as pd

df = pd.DataFrame({"date": ["2026-01-01", "2026-01-02"], "sales": [100, 120]})
df["date"] = pd.to_datetime(df["date"])
ts = df.set_index("date")["sales"]
print(ts.index.dtype)  # datetime64[ns]
```

Explanation: Once a `DatetimeIndex` is set, pandas unlocks calendar-aware slicing (like `ts["2026-01"]`) and resampling.

### 2. Resampling (`.resample()`)

`ts.resample("ME").sum()` groups daily observations into monthly buckets (`"ME"` = month-end in pandas 2.2+; `"W"` = weekly) [src:pandas-docs].

```python
import pandas as pd

dates = pd.date_range("2026-01-01", periods=40, freq="D")
ts = pd.Series(range(40), index=dates)
print(ts.resample("ME").sum())
```

Explanation: Think of `resample()` as `groupby()` specifically for calendar time buckets.

### 3. Rolling Windows (`.rolling()`)

`ts.rolling(window=7).mean()` computes a 7-day moving average to smooth out daily spikes [src:pandas-docs].

```python
import pandas as pd

s = pd.Series([10, 12, 14, 16])
print(s.rolling(2).mean().tolist())  # [nan, 11.0, 13.0, 15.0]
```

Explanation: The first `window - 1` rows are `NaN` because there are not enough prior points yet to fill the window.

Note: Behavior may differ between versions. Check the official docs for your installed version (note `"ME"` vs `"M"` in `resample`).

## Why it matters

Sales, website traffic, attendance, and financial metrics are all time series where moving averages reveal trends hidden by daily noise.

## Worked example

```python
import pandas as pd

dates = pd.date_range("2026-01-01", periods=6, freq="D")
s = pd.Series([10, 12, 14, 16, 18, 20], index=dates)
print("3-day rolling mean:\n", s.rolling(3).mean())
```

## Common mistakes

- **Resampling on unsorted dates or non-datetime index**: Always sort by the datetime column before calling `.rolling()` or `.resample()` [src:pandas-docs].

## Check your understanding

1. What is the difference between `.resample()` and `.rolling()`?
2. Complete the exercises on the right.

## Sources

- [src:pandas-docs] pandas Documentation (pandas development team)
- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
