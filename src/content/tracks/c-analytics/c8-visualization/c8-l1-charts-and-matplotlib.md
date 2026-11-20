---
id: "c8-l1-charts-and-matplotlib"
moduleId: "c8-visualization"
title: "Chart Selection, Matplotlib Basics, and Honest Scales"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Select an appropriate chart type (bar, line, histogram, scatter, box)"
  - "Create labeled figures using Matplotlib's fig, ax = plt.subplots() API"
  - "Spot misleading chart practices such as truncated bar-chart y-axes"
prerequisites: ["c7-l1-datetime-resampling-rolling"]
packages: ["matplotlib"]
sources: ["matplotlib-docs", "seaborn-docs", "python-ds-handbook"]
tags: ["visualization", "matplotlib", "seaborn", "charts"]
---

## Concept

### 1. Choosing the Right Chart

Select the chart that matches your data's structure [src:matplotlib-docs]:
- **Bar chart**: Compare quantities across discrete categories (`ax.bar`).
- **Line chart**: Show trends over continuous time (`ax.plot`).
- **Histogram / Box plot**: Show the distribution and spread of a numeric variable (`ax.hist`, `ax.boxplot`).
- **Scatter plot**: Show the relationship between two numeric variables (`ax.scatter`).

Explanation: Choosing the wrong chart hides the story (for example, using a line chart for unordered categories implies a non-existent trend between them).

### 2. Matplotlib Object-Oriented API (`fig, ax`) and `seaborn`

Prefer the explicit object-oriented interface: `fig, ax = plt.subplots()`, then `ax.bar(...)`, `ax.set_title(...)`, `ax.set_xlabel(...)`, `ax.set_ylabel(...)` [src:matplotlib-docs]. `seaborn` builds on Matplotlib with concise statistical defaults (`sns.histplot`, `sns.boxplot`) [src:seaborn-docs].

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(["Jan", "Feb", "Mar"], [100, 125, 140], marker="o")
ax.set_title("Monthly Orders")
ax.set_ylabel("Count")
```

Explanation: Using `fig, ax = plt.subplots()` gives you direct handles to the figure (`fig`) and axes (`ax`), which scales cleanly when you put multiple subplots side by side.

### 3. Avoiding Misleading Charts

- **Start bar charts at 0**: Truncating the y-axis on a bar chart exaggerates small differences because readers judge bar length visually.
- **Always label axes and units**: Unlabeled numbers invite misinterpretation.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Decision-makers often remember the chart longer than the table. Clear, honest charts build trust.

## Worked example

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.bar(["IS", "CS", "IT"], [42, 38, 29])
ax.set_title("Enrollment by Department")
ax.set_ylabel("Students")
```

## Common mistakes

- **Pie charts with too many slices**: Humans compare bar lengths much more accurately than pie slice angles.

## Check your understanding

1. Which chart type best shows the distribution of a single numeric column?
2. Why should bar charts normally start at `y = 0`?
3. Complete the exercises on the right and experiment in the **Chart Lab**!

## Sources

- [src:matplotlib-docs] Matplotlib Documentation (Matplotlib development team)
- [src:seaborn-docs] seaborn Documentation (Michael Waskom)
- [src:python-ds-handbook] Python Data Science Handbook (Jake VanderPlas)
