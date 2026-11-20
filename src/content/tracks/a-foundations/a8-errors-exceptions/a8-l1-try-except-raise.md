---
id: "a8-l1-try-except-raise"
moduleId: "a8-errors-exceptions"
title: "Handling Exceptions (try, except, else, finally, raise)"
order: 1
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Catch specific exception types with try / except and inspect the error object"
  - "Use else and finally blocks appropriately"
  - "Raise explicit ValueError exceptions for invalid inputs"
  - "Avoid bare except clauses that hide real bugs"
prerequisites: ["a7-l1-comprehensions-and-builtins"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["exceptions", "try", "except", "raise", "debugging"]
---

## Concept

### 1. `try / except` With Specific Exception Types

When an error occurs at runtime, Python raises an **exception** (such as `ValueError`, `ZeroDivisionError`, `KeyError`, or `FileNotFoundError`) [src:python-tutorial]. You catch expected errors by naming the specific exception type in `except` [src:pep8].

```python
raw = "N/A"
try:
    qty = int(raw)
except ValueError as err:
    print("Invalid number:", err)
    qty = 0
```

Explanation: Think of `try / except` as a safety net targeted at one specific risk. Naming `ValueError` handles bad numeric text while still letting real bugs (like a `NameError` typo) surface immediately.

### 2. `else` and `finally`

- `else`: Runs **only if** the `try` block finished without raising an exception [src:python-tutorial].
- `finally`: **Always** runs afterward (whether an exception occurred or not), used for cleanup [src:python-tutorial].

```python
try:
    rate = float("0.12")
except ValueError:
    print("Bad rate")
else:
    print("Parsed rate:", rate)
finally:
    print("Validation finished")
```

Explanation: Keeping post-success code inside `else` rather than `try` ensures your `except` block only catches errors from the exact line you intended to guard.

### 3. Raising Exceptions With `raise`

Use `raise ValueError("message")` to reject invalid arguments early instead of letting bad data corrupt downstream calculations [src:python-tutorial].

```python
def set_discount(pct):
    if not (0 <= pct <= 100):
        raise ValueError("Discount must be between 0 and 100")
    return pct / 100
```

Explanation: Failing fast with a clear `ValueError` makes debugging much easier than silently computing a negative price.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Real datasets contain malformed numbers (`"N/A"`), missing dictionary keys, and zero denominators. Defensive exception handling keeps batch pipelines from crashing on a single bad row.

## Worked example

```python
def parse_positive_int(raw):
    try:
        num = int(raw)
    except ValueError:
        return None
    if num <= 0:
        raise ValueError("Value must be positive")
    return num

print(parse_positive_int("42"))
print(parse_positive_int("N/A"))
```

## Common mistakes

- **Using bare `except:`**: Catching everything swallows `KeyboardInterrupt`, `NameError` typos, and unexpected bugs [src:pep8].
- **Wrapping too much code in `try:`**: Keep `try` focused on the exact line that may fail so you know what triggered the `except` block [src:python-tutorial].

## Check your understanding

1. When does the `else` block of a `try / except / else` statement run?
2. Why does PEP 8 discourage bare `except:` clauses?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
