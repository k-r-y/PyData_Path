---
id: "b9-l1-stdlib-for-analysts"
moduleId: "b9-stdlib-analysts"
title: "datetime, collections, statistics, random, re, and pathlib"
order: 1
estimatedMinutes: 24
difficulty: "intermediate"
objectives:
  - "Parse and format dates using datetime.strptime() and strftime()"
  - "Count frequencies and group items with collections.Counter and defaultdict"
  - "Compute quick summaries with statistics and reproducible samples with random"
  - "Extract patterns with re.findall() and build paths with pathlib.Path"
prerequisites: ["b8-l1-big-o-and-timeit"]
packages: []
sources: ["python-tutorial"]
tags: ["datetime", "collections", "Counter", "re", "pathlib"]
---

## Concept

### 1. `datetime`: Parsing and Formatting Dates

`datetime.strptime(text, fmt)` parses date strings into `datetime` objects, and `.strftime(fmt)` formats them back to text [src:python-tutorial].

```python
from datetime import datetime

dt = datetime.strptime("2026-11-19", "%Y-%m-%d")
print(dt.strftime("%b %d, %Y"))  # Nov 19, 2026
```

Explanation: Remember `strptime` = **p**arse from string, `strftime` = **f**ormat to string.

### 2. `collections`: `Counter` and `defaultdict`

- `Counter(iterable)`: Counts occurrences and provides `.most_common(n)` [src:python-tutorial].
- `defaultdict(list)`: Automatically initializes missing keys with a default factory (such as `list` or `int`) [src:python-tutorial].

```python
from collections import Counter, defaultdict

counts = Counter(["IS", "CS", "IS"])
print(counts.most_common(1))  # [('IS', 2)]

groups = defaultdict(list)
groups["North"].append(100)
print(dict(groups))           # {'North': [100]}
```

Explanation: `Counter` replaces manual counting loops, and `defaultdict(list)` avoids writing `if key not in groups: groups[key] = []` before appending.

### 3. `statistics` and `random`

`statistics` provides `mean()`, `median()`, and `stdev()` for quick numeric summaries without installing third-party libraries [src:python-tutorial]. `random` provides `seed()`, `choice()`, and `sample()` for reproducible synthetic data [src:python-tutorial].

```python
import statistics, random

random.seed(42)
sample = random.sample(range(1, 100), 5)
print("Sample:", sample, "Mean:", statistics.mean(sample))
```

### 4. `re` (Regular Expressions) and `pathlib.Path`

`re.findall(r"\d+", text)` extracts matching substrings using raw strings (`r"..."`), and `pathlib.Path` builds cross-platform file paths cleanly with `/` [src:python-tutorial].

```python
import re
from pathlib import Path

nums = re.findall(r"\d+", "Order #104: 3 items")
p = Path("data") / "sales.csv"
print(nums, p.name)  # ['104', '3'] sales.csv
```

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
