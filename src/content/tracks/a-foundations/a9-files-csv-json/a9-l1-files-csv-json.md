---
id: "a9-l1-files-csv-json"
moduleId: "a9-files-csv-json"
title: "Files, with Statement, CSV, and JSON"
order: 1
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Open and close files safely using the with context manager"
  - "Choose file modes ('r', 'w', 'a') and specify encoding='utf-8'"
  - "Parse tabular text using csv.DictReader"
  - "Serialize and deserialize data using json.loads() and json.dumps()"
prerequisites: ["a8-l1-try-except-raise"]
packages: []
sources: ["python-tutorial", "pyodide-docs"]
tags: ["files", "with", "csv", "json"]
---

## Concept

### The `with` Statement and File Modes

Always open files using `with open(path, mode, encoding="utf-8") as f:` so Python closes the file automatically even if an error occurs [src:python-tutorial]:
- `"r"`: Read (default).
- `"w"`: Write (creates or **overwrites** existing file).
- `"a"`: Append to the end.

Note: In PyData Path, file operations run against Pyodide's **in-memory virtual filesystem** rather than your computer's hard drive [src:pyodide-docs].

### Standard Library `csv` and `json`

- `csv.DictReader(f)`: Reads each row of a CSV file as a `dict` keyed by the header column names (all values start as `str`) [src:python-tutorial].
- `json.loads(text)` / `json.load(f)`: Parses JSON text/file into Python `dict` and `list` objects [src:python-tutorial].
- `json.dumps(obj)` / `json.dump(obj, f)`: Converts Python objects into JSON [src:python-tutorial].

Explanation: Think of `with open(...)` as a self-closing door. Using `csv.DictReader` turns each comma-separated line into a labeled dictionary so you can access `row["amount"]` by name instead of fragile column numbers.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Before using pandas, knowing `csv` and `json` lets you inspect raw files, parse API responses, and write lightweight data scripts using only the Python Standard Library.

## Worked example

```python
import csv
import io

sample_csv = "item,cost\nNotebook,4.50\nPen,1.50\n"
reader = csv.DictReader(io.StringIO(sample_csv))
total = sum(float(row["cost"]) for row in reader)
print(f"Total expense: ${total:.2f}")
```

## Common mistakes

- **Forgetting `float()` on `csv.DictReader` values**: CSV files are plain text, so `row["cost"]` is `"4.50"` (`str`), not `4.5` (`float`) [src:python-tutorial].
- **Opening with `"w"` when you meant `"a"`**: `"w"` erases existing file contents immediately upon opening [src:python-tutorial].

## Check your understanding

1. Why is `with open(...)` preferred over calling `f = open(...)` and `f.close()` manually?
2. What type are the values in each `row` returned by `csv.DictReader`?
3. Complete the exercises on the right, including the Expense Summary from CSV mini-project.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:pyodide-docs] Pyodide Documentation (Pyodide contributors)
