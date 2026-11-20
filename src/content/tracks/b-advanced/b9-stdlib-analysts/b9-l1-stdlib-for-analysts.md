---
id: "b9-l1-stdlib-for-analysts"
moduleId: "b9-stdlib-analysts"
title: "datetime, collections, statistics, random, re, and pathlib"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Parse and format dates using datetime.strptime() and strftime()"
  - "Count frequencies and group items with collections.Counter and defaultdict"
  - "Extract patterns with re.findall() and build paths with pathlib.Path"
prerequisites: ["b8-l1-big-o-and-timeit"]
packages: []
sources: ["python-tutorial"]
tags: ["datetime", "collections", "Counter", "re", "pathlib"]
---

## Concept

Python's Standard Library includes several high-value modules for analysts [src:python-tutorial]:
- `datetime`: `datetime.strptime("2026-11-19", "%Y-%m-%d")` parses date strings; `.strftime(...)` formats dates back to text [src:python-tutorial].
- `collections.Counter`: Counts occurrences in any iterable (`Counter(["a", "b", "a"]).most_common(1)`) [src:python-tutorial].
- `collections.defaultdict(list)`: Automatically initializes missing keys with a default factory (such as `list` or `int`) [src:python-tutorial].
- `statistics`: `mean()`, `median()`, `stdev()` for quick numeric summaries without external packages [src:python-tutorial].
- `random`: `random.seed(42)`, `random.choice()`, `random.sample()` for reproducible synthetic sampling [src:python-tutorial].
- `re`: Regular expressions (`re.findall(r"\d+", text)`) for extracting structured tokens from messy strings [src:python-tutorial].
- `pathlib.Path`: Object-oriented filesystem paths (`Path("data") / "sales.csv"`) [src:python-tutorial].

Explanation: Think of `Counter` as an instant tally sheet: instead of writing a 5-line `if key in counts:` loop, `Counter(items)` counts everything in one call.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Log parsing, date normalization, frequency counts, and clean file paths show up in nearly every analytics script before you even reach pandas.

## Worked example

```python
from collections import Counter
import re

log = "ERR 404 /home | OK 200 /api | ERR 500 /api | ERR 404 /login"
codes = re.findall(r"\b\d{3}\b", log)
print("Top status:", Counter(codes).most_common(1))
```

## Common mistakes

- **Using `re` without raw strings (`r"..."`)**: Backslashes like `\d` or `\b` should always be written in raw strings (`r"\d+"`) so Python does not interpret them as string escapes [src:python-tutorial].

## Check your understanding

1. Which `collections` class counts frequencies in one line?
2. Why should regex patterns use raw strings like `r"\d+"`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
