---
id: "c9-l1-descriptive-stats-correlation"
moduleId: "c9-statistics-fundamentals"
title: "Center, Spread, Distributions, and Correlation vs Causation"
order: 1
estimatedMinutes: 22
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

### 1. Measures of Center: Mean, Median, Mode

- **Mean**: Arithmetic average (`np.mean(x)`), sensitive to extreme outliers [src:openintro-stats].
- **Median**: Middle value / 50th percentile (`np.median(x)`), robust on skewed data [src:openintro-stats].
- **Mode**: Most frequent value, useful for categorical data.

```python
import numpy as np

salaries = np.array([30, 32, 35, 38, 500])
print("Mean:", np.mean(salaries), "Median:", np.median(salaries))  # 127.0 vs 35.0
```

Explanation: If 4 people earn \$35k and 1 executive earns \$500k, the *mean* jumps to \$127k while the *median* stays at \$35k. Always check both!

### 2. Measures of Spread: Variance, Standard Deviation, and IQR

- **Variance & Standard Deviation (`np.std`)**: Typical distance from the mean [src:openintro-stats].
- **Interquartile Range (`IQR = Q3 - Q1`)**: Width of the middle 50% of observations, robust to outliers [src:openintro-stats].

```python
import numpy as np

x = np.array([10, 12, 14, 16, 18])
q75, q25 = np.percentile(x, [75, 25])
print("Std:", round(float(np.std(x)), 2), "IQR:", q75 - q25)
```

### 3. Correlation (`r`) vs Causation

Pearson correlation `r` ranges from `-1` to `+1` and measures the strength and direction of a **linear** relationship [src:openintro-stats]. Two variables can correlate strongly due to a **confounding variable** rather than direct causation, and a single outlier can distort `r` [src:openintro-stats].

```python
import numpy as np

hours = np.array([1, 2, 3, 4, 5])
scores = np.array([65, 72, 78, 85, 92])
print("Pearson r:", round(float(np.corrcoef(hours, scores)[0, 1]), 3))
```

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
