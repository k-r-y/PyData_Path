---
id: "c12-l1-memos-and-insights"
moduleId: "c12-communicating-findings"
title: "Observations vs Insights and One-Page Findings Memos"
order: 1
estimatedMinutes: 16
difficulty: "intermediate"
objectives:
  - "Distinguish a raw observation from an actionable insight"
  - "Structure a one-page findings memo for non-technical stakeholders"
  - "State dataset limitations and assumptions honestly"
prerequisites: ["c11-l1-structured-eda"]
packages: []
sources: ["python-data-analysis"]
tags: ["communication", "memos", "insights"]
---

## Concept

### 1. Observations vs Insights

Numbers alone rarely drive decisions [src:python-data-analysis]:
- **Observation**: What the data literally shows ("North region revenue rose 18% in Q1").
- **Insight**: *Why* it matters and what decision it informs ("Bundling USB-C Hubs with Laptops drove 60% of North region's growth; consider expanding that bundle to South").

```python
# Turning metrics into a plain-language insight line
region, growth_pct, top_driver = "North", 18.4, "USB-C Hub bundles"
print(f"Insight: {region} grew {growth_pct:.1f}%, driven by {top_driver}; test this bundle in South.")
```

Explanation: An observation answers "What happened?", while an insight answers "So what, and what should we do next?"

### 2. One-Page BLUF Memo Structure & Limitations

A strong one-page memo follows **BLUF**:
1. **Bottom Line Up Front (BLUF)**: State the main conclusion and recommendation first.
2. **Key Evidence**: 2 to 3 clear metrics or labeled charts.
3. **Limitations**: What the data does *not* prove (small sample size, missing weeks, observational correlation).

Explanation: Executives and instructors read the first paragraph first. Putting your main answer at the top (BLUF) respects their time, while keeping technical code and raw tables in an appendix.

## Why it matters

An analyst who can explain findings clearly to non-technical teammates multiplies the impact of every Python script they write.

## Worked example

```python
region = "North"
growth_pct = 18.4
print(f"Key Finding: {region} revenue grew {growth_pct:.1f}% vs last quarter, led by Electronics.")
```

## Common mistakes

- **Dumping raw p-values or DataFrame printouts without context**: Translate statistics into plain English ("average order value was \$4.20 higher, 95% CI [\$1.80, \$6.60]").

## Check your understanding

1. What is the difference between an observation and an insight?
2. Complete the exercises on the right and draft a sample memo in **EDA & Capstone**.

## Sources

- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
