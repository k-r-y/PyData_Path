---
id: "a9-l1-files-csv-json"
moduleId: "a9-files-csv-json"
title: "Files, with Statement, CSV, and JSON"
order: 1
estimatedMinutes: 22
difficulty: "beginner"
objectives:
  - "Open and close files safely using the with context manager"
  - "Choose file modes ('r', 'w', 'a') and specify encoding='utf-8'"
  - "Parse and write tabular text using csv.DictReader and csv.writer"
  - "Serialize and deserialize data using json.loads() and json.dumps()"
prerequisites: ["a8-l1-try-except-raise"]
packages: []
sources: ["python-tutorial", "pyodide-docs"]
tags: ["files", "with", "csv", "json"]
---

## Concept

### 1. The `with` Statement and File Modes

Always open files using `with open(path, mode, encoding="utf-8") as f:` so Python closes the file automatically even if an error occurs [src:python-tutorial]:
- `"r"`: Read (default).
- `"w"`: Write (creates or **overwrites** existing file).
- `"a"`: Append to the end.

```python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Line 1\n")

with open("notes.txt", "r", encoding="utf-8") as f:
    print(f.read().strip())
```

Explanation: Think of `with open(...)` as a self-closing door: you never have to remember `f.close()`, and the file is closed cleanly even if an exception occurs mid-read. Note that in PyData Path, file operations run against Pyodide's **in-memory virtual filesystem** rather than your hard drive [src:pyodide-docs].

### 2. Standard Library `csv` (`csv.DictReader` and `csv.writer`)

`csv.DictReader(f)` reads each row of a CSV file as a `dict` keyed by the header column names (all values start as `str`) [src:python-tutorial].

```python
import csv
import io

text = "sku,qty\nA1,5\nB2,12\n"
for row in csv.DictReader(io.StringIO(text)):
    print(row["sku"], int(row["qty"]))
```

Explanation: Using `csv.DictReader` lets you read `row["qty"]` by column name instead of fragile numeric column indices like `row[1]`. Remember to convert numeric strings with `int()` or `float()`.

### 3. Standard Library `json` (`loads`, `dumps`, `load`, `dump`)

- `json.loads(text)` / `json.load(f)`: Parses JSON into Python `dict` and `list` objects [src:python-tutorial].
- `json.dumps(obj, indent=2)` / `json.dump(obj, f)`: Serializes Python objects into JSON [src:python-tutorial].

```python
import json

payload = '{"course": "IS-301", "active": true, "waitlist": null}'
parsed = json.loads(payload)
print(parsed["course"], parsed["active"], parsed["waitlist"])
```

Explanation: Remember the trailing `s` in `loads` / `dumps` stands for **s**tring (`json.loads(str)`), while `load(f)` / `dump(obj, f)` work directly with open file objects.

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
