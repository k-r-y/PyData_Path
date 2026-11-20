---
id: "c7-l1-datetime-resampling-rolling"
moduleId: "c7-time-series"
title: "DatetimeIndex, Resampling, and Rolling Windows"
order: 1
estimatedMinutes: 18
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

To analyze trends over time in `pandas` [src:pandas-docs]:
1. Convert strings with `df["date"] = pd.to_datetime(df["date"])` and sort by date.
2. Set the index: `ts = df.set_index("date")["sales"]`.
3. **Resample** to a coarser frequency: `ts.resample("ME").sum()` sums sales per month-end (`"ME"` in pandas 2.2+; `"M"` in older versions) [src:pandas-docs].
4. **Rolling window**: `ts.rolling(window=7).mean()` computes a 7-day moving average to smooth daily spikes [src:pandas-docs].

Note: Behavior may differ between versions. Check the official docs for your installed version (note `"ME"` vs `"M"` in `resample`).

Explanation: Think of `resample` as grouping by calendar buckets (days -> months), while `rolling` slides a fixed-width window across the timeline to show the underlying trend.

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
