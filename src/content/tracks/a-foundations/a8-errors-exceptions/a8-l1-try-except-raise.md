---
id: "a8-l1-try-except-raise"
moduleId: "a8-errors-exceptions"
title: "Handling Exceptions (try, except, else, finally, raise)"
order: 1
estimatedMinutes: 18
difficulty: "beginner"
objectives:
  - "Catch specific exception types with try / except"
  - "Use else and finally blocks appropriately"
  - "Raise explicit ValueError exceptions for invalid inputs"
  - "Avoid bare except clauses that hide real bugs"
prerequisites: ["a7-l1-comprehensions-and-builtins"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["exceptions", "try", "except", "raise", "debugging"]
---

## Concept

When an error occurs at runtime, Python raises an **exception** [src:python-tutorial]. You can handle expected failures with `try / except` [src:python-tutorial]:
- `try`: Code that might raise an exception.
- `except ValueError as err`: Runs only if a `ValueError` occurs. Always name specific exception types rather than using a bare `except:` [src:pep8].
- `else`: Runs only if the `try` block succeeded with no exception [src:python-tutorial].
- `finally`: Always runs afterward (whether an exception occurred or not), used for cleanup [src:python-tutorial].
- `raise ValueError("message")`: Intentionally signals an invalid state or argument [src:python-tutorial].

Explanation: Think of `try / except` as a safety net under a trapeze: you only put the specific risky step inside `try`, and you specify which kind of fall (`ValueError`, `ZeroDivisionError`) you know how to recover from.

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
