---
id: "c12-l1-memos-and-insights"
moduleId: "c12-communicating-findings"
title: "Observations vs Insights and One-Page Findings Memos"
order: 1
estimatedMinutes: 15
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

Numbers alone rarely drive decisions [src:python-data-analysis]:
- **Observation**: What the data literally shows ("North region revenue rose 18% in Q1").
- **Insight**: *Why* it matters and what decision it informs ("Bundling USB-C Hubs with Laptops drove 60% of North region's growth; consider expanding that bundle to South").
- **Limitations**: What the data does *not* prove (small sample size, missing weeks, observational correlation).

A strong one-page memo follows: **Bottom Line Up Front (BLUF)** -> **Key Evidence (2-3 metrics/charts)** -> **Limitations** -> **Recommended Next Step**.

Explanation: Executives and instructors read the first paragraph first. Putting your main answer at the top (BLUF) respects their time, while keeping technical code and raw tables in an appendix.

## Why it matters

An analyst who can explain findings clearly to non-technical teammates multiplies the impact of every Python script they write.

## Worked example

```python
# Generating a clean, plain-language executive summary line from metrics
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
