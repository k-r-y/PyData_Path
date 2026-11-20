---
id: "c1-l1-analytics-lifecycle"
moduleId: "c1-analytics-process"
title: "The Analytics Workflow, Data Quality, and Ethics"
order: 1
estimatedMinutes: 16
difficulty: "beginner"
objectives:
  - "Sequence the 5 stages of the analytics process: question, data, clean, analyze, communicate"
  - "Distinguish nominal, ordinal, discrete, and continuous data"
  - "Evaluate datasets across completeness, accuracy, consistency, and timeliness"
  - "Identify basic privacy risks such as personally identifiable information (PII)"
prerequisites: ["b9-l1-stdlib-for-analysts"]
packages: []
sources: ["openintro-stats", "python-data-analysis"]
tags: ["analytics-process", "data-quality", "ethics", "privacy"]
---

## Concept

### 1. The 5-Stage Analytics Process

Effective data analytics follows a repeatable 5-stage cycle [src:python-data-analysis]:
1. **Question**: Define a specific, measurable decision before touching code.
2. **Data**: Gather relevant data and verify its license and provenance.
3. **Clean**: Inspect missing values, duplicates, types, and formatting errors.
4. **Analyze**: Summarize, segment, visualize, and test hypotheses.
5. **Communicate**: Present clear findings, limitations, and recommendations.

Explanation: Starting with a vague goal like "analyze sales" leads to aimless charts. Framing a concrete question like "Which product category had the highest return rate in Q1?" immediately tells you which columns and cleaning steps matter.

### 2. Types of Data

In statistics, variables are classified as **categorical** (nominal without order like department, or ordinal with order like `"Low" < "Med" < "High"`) or **numerical** (discrete counts or continuous measurements) [src:openintro-stats].

```python
# Nominal vs Ordinal vs Numerical
department = "IS"        # nominal categorical
rating = "High"          # ordinal categorical (Low < Med < High)
enrolled = 42            # discrete numerical
gpa = 3.75               # continuous numerical
```

### 3. Data Quality Dimensions & Ethics

Data quality is assessed across **completeness** (missing values), **accuracy** (correct values), **consistency** (uniform units and formats), and **timeliness** (up-to-date records). Always remove or mask personally identifiable information (PII) such as emails or student IDs before sharing datasets.

```python
records = [
    {"id": 1, "dept": "IS", "gpa": 3.5},
    {"id": 2, "dept": "is", "gpa": None},
]
missing_gpa = sum(1 for r in records if r["gpa"] is None)
print("Missing GPA count:", missing_gpa)
```

Explanation: Inconsistent casing (`"IS"` vs `"is"`) splits one group into two separate bars on a chart, which is why consistency checks come before analysis.

## Why it matters

Technical Python skills only create value when they answer real questions accurately and responsibly.

## Worked example

```python
records = [
    {"id": 1, "dept": "IS", "gpa": 3.5},
    {"id": 2, "dept": "is", "gpa": None},
    {"id": 2, "dept": "is", "gpa": None},
]

missing_gpa = sum(1 for r in records if r["gpa"] is None)
unique_ids = len({r["id"] for r in records})
print(f"Rows: {len(records)}, Unique IDs: {unique_ids}, Missing GPA: {missing_gpa}")
```

## Common mistakes

- **Skipping cleaning and jumping straight to charts**: Inconsistent labels (`"IS"` vs `"is"`) split one category into two bars on a chart.

## Check your understanding

1. Why is `"IS"` vs `"is"` a consistency issue?
2. What is the difference between nominal and ordinal categorical data?
3. Complete the exercises on the right.

## Sources

- [src:openintro-stats] OpenIntro Statistics (Diez, Cetinkaya-Rundel, Barr)
- [src:python-data-analysis] Python for Data Analysis (Wes McKinney)
