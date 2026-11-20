---
id: "c14-l1-capstone-guide"
moduleId: "c14-capstone"
title: "End-to-End Analytics Capstone"
order: 1
estimatedMinutes: 45
difficulty: "advanced"
objectives:
  - "Combine cleaning, transformation, visualization, and statistical reasoning in one analysis"
  - "Document analytical choices and limitations transparently"
  - "Deliver a concise findings memo using the EDA & Capstone workspace"
prerequisites: ["c13-l1-supervised-ml-basics"]
packages: ["numpy", "pandas"]
sources: ["python-data-analysis", "openintro-stats"]
tags: ["capstone", "eda", "portfolio"]
---

## Concept

Your Capstone brings together every skill from Tracks A, B, and C into a portfolio-ready end-to-end analysis [src:python-data-analysis]:

1. **Choose a dataset**: Start with `store_sales.csv` or `student_enrollments.csv` in the **DataFrame Lab**, or upload an openly licensed CSV you care about.
2. **Frame 2-3 questions**: Write down specific questions before coding.
3. **Clean & Validate**: Check missing values, duplicates, dtypes, and outliers.
4. **Analyze & Visualize**: Compute grouped summaries and build at least 2 clear charts in the **Chart Lab**.
5. **Write Your Memo**: Open the **EDA & Capstone** page in the sidebar, check off the workflow steps, self-assess against the rubric, and write your BLUF findings memo.

Explanation: A great portfolio project does not need a massive dataset or complex neural network. Employers and professors value clear thinking, clean reproducible code, honest limitations, and crisp communication.

## Why it matters

Completing a full question-to-memo project turns isolated Python syntax into a demonstrable Information Systems analytics portfolio piece.

## Worked example

```python
import pandas as pd

# Example capstone summary check
df = pd.DataFrame({
    "region": ["North", "South", "North"],
    "units": [3, 10, 5],
    "price": [24.5, 4.25, 18.0],
})
df["revenue"] = df["units"] * df["price"]
print(df.groupby("region")["revenue"].agg(["sum", "mean"]))
```

## Common mistakes

- **Skipping the limitations section**: Every dataset has gaps or biases; stating them builds credibility [src:openintro-stats].

## Check your understanding

1. Complete the final automated capstone helper exercise on the right, then open **EDA & Capstone** in the sidebar to complete your checklist and findings memo!

## Sources

- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
- [src:openintro-stats] OpenIntro Statistics (Diez, Cetinkaya-Rundel, Barr)
