---
id: "c9-l1-descriptive-stats-correlation"
moduleId: "c9-statistics-fundamentals"
title: "Center, Spread, Distributions, and Correlation vs Causation"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Choose between mean and median based on skewness and outliers"
  - "Measure spread using variance, standard deviation, and IQR"
  - "Interpret Pearson correlation r and explain why correlation does not imply causation"
prerequisites: ["c8-l1-charts-and-matplotlib"]
packages: ["numpy", "pandas"]
sources: ["openintro-stats", "think-stats", "numpy-docs"]
tags: ["statistics", "mean", "median", "std", "correlation"]
---

## Concept

Descriptive statistics summarize center and spread [src:openintro-stats]:
- **Mean vs Median**: The mean is sensitive to extreme outliers; the **median** (50th percentile) is robust on skewed data such as income or order values [src:openintro-stats].
- **Spread**: Variance and standard deviation (`std`) measure typical distance from the mean; the **interquartile range (IQR = Q3 - Q1)** measures the middle 50% robustly [src:openintro-stats].
- **Correlation (`r`)**: Measures the strength and direction of a **linear** relationship between `-1` and `+1` [src:openintro-stats]. A single extreme outlier can distort `r`, and two variables can correlate due to a **confounding variable** rather than direct causation [src:openintro-stats].

Explanation: If 9 people in a room earn \$30k and 1 billionaire walks in, the *mean* jumps above \$100M while the *median* stays at \$30k. Always check both!

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Reporting only the mean on skewed business data misleads stakeholders; pairing median + IQR or mean + std gives an honest picture.

## Worked example

```python
import numpy as np

orders = np.array([15, 20, 22, 25, 500])
print("Mean:", np.mean(orders), "Median:", np.median(orders))
```

## Common mistakes

- **Treating `r = 0.8` as proof of causation**: Ice cream sales and drowning incidents correlate strongly because *summer heat* is a confounder [src:openintro-stats].

## Check your understanding

1. When is the median preferred over the mean?
2. Test how a single outlier shifts Pearson `r` in the **Stats Simulators** page!
3. Complete the exercises on the right.

## Sources

- [src:openintro-stats] OpenIntro Statistics (Diez, Cetinkaya-Rundel, Barr)
- [src:think-stats] Think Stats (Allen B. Downey)
- [src:numpy-docs] NumPy Documentation (NumPy community)
