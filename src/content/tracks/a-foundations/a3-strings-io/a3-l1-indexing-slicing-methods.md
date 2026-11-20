---
id: "a3-l1-indexing-slicing-methods"
moduleId: "a3-strings-io"
title: "String Indexing, Slicing, and Core Methods"
order: 1
estimatedMinutes: 16
difficulty: "beginner"
objectives:
  - "Access individual characters using positive and negative indices"
  - "Extract substrings using slice syntax s[start:stop:step]"
  - "Explain why strings are immutable in Python"
  - "Clean and transform text using strip(), lower(), upper(), replace(), split(), and join()"
prerequisites: ["a2-l2-operators-conversion-truthiness"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["strings", "indexing", "slicing", "methods"]
---

## Concept

A Python `str` is an ordered, **immutable** sequence of Unicode characters [src:python-tutorial]. Because it is immutable, you cannot modify a character in place (for example, `code[0] = "X"` raises a `TypeError`); instead, string operations return a new string [src:python-tutorial].

### Indexing and Slicing

- **Indexing**: Positions start at `0` from the left (`s[0]` is the first character) and `-1` from the right (`s[-1]` is the last character) [src:python-tutorial].
- **Slicing**: `s[start:stop]` extracts characters from index `start` up to, **but not including**, index `stop` [src:python-tutorial]. Omitting `start` defaults to `0`; omitting `stop` defaults to `len(s)`. An optional third value `step` controls stride (for example, `s[::-1]` reverses a string) [src:python-tutorial].

Explanation: Think of slice indices as sitting *between* characters rather than on them. For `"DATA"`, index `0` is before `D`, index `2` is between `A` and `T`, so `"DATA"[0:2]` gives `"DA"` (length `2 - 0 = 2`).

### Essential String Methods

- `.strip()`: Removes leading and trailing whitespace (or specified characters) [src:python-tutorial].
- `.lower()` / `.upper()`: Returns a lowercase or uppercase copy [src:python-tutorial].
- `.replace(old, new)`: Returns a copy with occurrences of `old` replaced by `new` [src:python-tutorial].
- `.split(sep)`: Splits a string into a `list` of substrings (defaults to splitting on whitespace if `sep` is omitted) [src:python-tutorial].
- `sep.join(items)`: Joins a sequence of strings using `sep` as the separator [src:python-tutorial].
- `sub in s`: Returns `True` if `sub` appears inside `s` [src:python-lang-ref].

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Real-world IS and analytics data is messy: product SKUs have extra spaces, city names have inconsistent capitalization, and CSV lines arrive as raw text. String methods and slicing are the first tools you use to standardize text before analysis.

## Worked example

```python
raw_record = "  is-301 | Business Analytics  "
cleaned = raw_record.strip()
parts = cleaned.split(" | ")

course_code = parts[0].upper()      # "IS-301"
dept = course_code[:2]              # "IS"
title = parts[1]                    # "Business Analytics"

print(dept, course_code, title, sep=" -> ")
```

Notice that `raw_record.strip()` does not change `raw_record`; it returns a new cleaned string that we assign to `cleaned` [src:python-tutorial].

## Common mistakes

- **Expecting `s[0:3]` to include index 3**: Slices are half-open `[start, stop)`, so `s[0:3]` returns indices `0`, `1`, and `2` [src:python-tutorial].
- **Forgetting to assign the result of `.strip()` or `.lower()`**: Calling `name.strip()` by itself discards the cleaned copy because strings are immutable [src:python-tutorial].
- **Calling `items.join(",")` instead of `",".join(items)`**: In Python, `join` is a method on the *separator string*, not on the list [src:python-tutorial].

## Check your understanding

1. Given `sku = "SKU-2026-A"`, what do `sku[:3]` and `sku[-1]` evaluate to?
2. Why does `text.lower()` not change `text` unless you write `text = text.lower()`?
3. Complete the exercises on the right to practice slicing, Parsons reordering, and cleaning an IS record.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
