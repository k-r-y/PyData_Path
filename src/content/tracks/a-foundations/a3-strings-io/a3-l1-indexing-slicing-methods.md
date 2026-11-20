---
id: "a3-l1-indexing-slicing-methods"
moduleId: "a3-strings-io"
title: "String Indexing, Slicing, Immutability, and Methods"
order: 1
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Access individual characters using positive and negative indices"
  - "Extract substrings using slice syntax s[start:stop:step]"
  - "Explain why strings are immutable in Python"
  - "Clean, search, and transform text using strip, lower/upper/title, replace, split, join, startswith/endswith, and in"
prerequisites: ["a2-l2-operators-conversion-truthiness"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["strings", "indexing", "slicing", "methods"]
---

## Concept

### 1. Indexing and Immutability

A Python `str` is an ordered, **immutable** sequence of Unicode characters [src:python-tutorial]. Positions start at `0` from the left (`s[0]`) and `-1` from the right (`s[-1]`) [src:python-tutorial]. Trying to index past the end raises `IndexError`, and trying `s[0] = "X"` raises `TypeError` because strings cannot be mutated in place.

```python
code = "IS-301"
print(code[0], code[-1], len(code))  # I 1 6
```

Explanation: Because strings are immutable, string methods never edit the original string; they always return a *new* string that you must assign to a variable if you want to keep it.

### 2. Slicing (`s[start:stop:step]`)

`s[start:stop:step]` extracts characters from `start` up to, **but not including**, `stop` [src:python-tutorial]. Omitting `start` defaults to `0`; omitting `stop` defaults to `len(s)`; `s[::-1]` reverses a string [src:python-tutorial]. Unlike single-index access, out-of-range slice bounds never raise `IndexError`.

```python
tag = "PYDATA26"
print(tag[0:2], tag[2:6], tag[-2:], tag[::2], tag[::-1])
```

Explanation: Think of slice indices as sitting *between* characters rather than on them. For `"DATA"`, index `0` is before `D` and index `2` is between `A` and `T`, so `"DATA"[0:2]` gives `"DA"` (length `2 - 0 = 2`).

### 3. Cleaning, Case, and Search Methods

- `.strip()` / `.lstrip()` / `.rstrip()`: Remove leading/trailing whitespace or specified characters [src:python-tutorial].
- `.lower()`, `.upper()`, `.title()`, `.capitalize()`: Normalize letter case [src:python-tutorial].
- `.replace(old, new)`: Replaces occurrences of `old` with `new` [src:python-tutorial].
- `.startswith(prefix)`, `.endswith(suffix)`, `sub in s`, `.find(sub)`, `.count(sub)`: Search and inspect substrings [src:python-tutorial].

```python
email = "  Ana.Reyes@School.EDU  ".strip().lower()
print(email.endswith(".edu"), "ana" in email)  # True True
```

### 4. Splitting and Joining (`split` and `join`)

- `.split(sep)`: Splits a string into a `list` of substrings (when `sep` is omitted, splits on any run of whitespace) [src:python-tutorial].
- `sep.join(items)`: Joins a sequence of strings using `sep` as the separator [src:python-tutorial].

```python
raw = "  ana , ben , cara  "
names = [n.strip().title() for n in raw.split(",")]
print(" | ".join(names))  # Ana | Ben | Cara
```

Explanation: Notice that `join` is called on the *separator string* (`" | ".join(names)`), not on the list itself.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Real-world IS and analytics data is messy: product SKUs have extra spaces, city names have inconsistent capitalization, and CSV lines arrive as raw text. String methods and slicing are the first tools you use to standardize text before analysis.

## Worked example

```python
raw_record = "  is-301 | Business Analytics  "
cleaned = raw_record.strip()
parts = cleaned.split(" | ")

course_code = parts[0].upper()
dept = course_code[:2]
title = parts[1]

print(dept, course_code, title, sep=" -> ")
```

## Common mistakes

- **Forgetting to assign the result of `.strip()` or `.lower()`**: Calling `name.strip()` by itself discards the cleaned copy because strings are immutable [src:python-tutorial].
- **Calling `items.join(",")` instead of `",".join(items)`**: In Python, `join` is a method on the separator string [src:python-tutorial].

## Check your understanding

1. Given `sku = "SKU-2026-A"`, what do `sku[:3]` and `sku[-1]` evaluate to?
2. Why does `s[0:100]` succeed without an error even when `len(s) == 5`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
