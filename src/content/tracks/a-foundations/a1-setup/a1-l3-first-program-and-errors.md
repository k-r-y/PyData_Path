---
id: "a1-l3-first-program-and-errors"
moduleId: "a1-setup"
title: "First Program, print(), and Reading Error Messages"
order: 3
estimatedMinutes: 18
difficulty: "beginner"
objectives:
  - "Use print() with multiple arguments, sep, and end"
  - "Read a Python traceback from bottom to top to locate errors"
  - "Distinguish SyntaxError, IndentationError, NameError, and TypeError"
prerequisites: ["a1-l2-setup-shell-and-anatomy"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["print", "errors", "traceback", "debugging"]
---

## Concept

### 1. Calling `print()` With Multiple Arguments, `sep`, and `end`

The built-in `print(*objects, sep=' ', end='\n')` function writes text to standard output [src:python-tutorial]:
- Passing comma-separated arguments converts each value with `str()` and joins them with `sep` (default `" "`).
- `end` controls what is printed after the last argument (default `"\n"`, a newline).

```python
print("IS-301", "Analytics", "2026", sep=" | ")
print("Step 1", end=" -> ")
print("Done")
```

Explanation: Passing comma-separated arguments to `print()` is safer than `+` because `print()` converts numbers and booleans to strings automatically for you.

### 2. Reading Python Tracebacks From Bottom to Top

When Python cannot parse or run your code, it prints a **traceback** [src:python-tutorial]. Always read a traceback from the **bottom line up**:
1. **Last line**: Shows the exception type (`SyntaxError`, `NameError`, `TypeError`) and a short description [src:python-tutorial].
2. **Line above it**: Shows the file name, line number, and exact source line where Python detected the problem [src:python-tutorial].

Four exceptions every beginner meets first:
- `SyntaxError`: Code structure cannot be parsed (e.g., missing quote or unclosed parenthesis) [src:python-tutorial].
- `IndentationError`: Unexpected leading spaces or missing indent after `:` [src:python-lang-ref].
- `NameError`: Using a variable or function name that has not been defined [src:python-lang-ref].
- `TypeError`: Applying an operation to an incompatible type (e.g., `"Total: " + 5`) [src:python-lang-ref].

```python
# SyntaxError example: print("Hello"
# NameError example:   print(totl_students)
# TypeError example:   print("Count: " + 45)
print("Count:", 45)  # Correct!
```

Explanation: Think of a traceback like a delivery failure receipt: the bottom line tells you *why* it failed (`NameError`), and the line right above it tells you *which address* (line number) had the problem.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Every programmer encounters errors daily. Learning to read the bottom line of a traceback calmly turns cryptic red text into exact debugging instructions.

## Worked example

```python
course_code = "IS-301"
enrolled = 38
capacity = 40

print("Course", course_code, sep=": ")
print("Enrolled:", enrolled, "of", capacity)
print("2026", "11", "19", sep="-")
```

## Common mistakes

- **Using `+` to join strings and numbers**: `print("Enrolled: " + 38)` raises a `TypeError`. Pass them as separate comma-separated arguments `print("Enrolled:", 38)` instead [src:python-tutorial].
- **Misreading `SyntaxError` line numbers**: If you forget a closing `)` on line 3, Python often reports the `SyntaxError` on line 4 [src:python-tutorial].

## Check your understanding

1. What does `print("A", "B", "C", sep="-")` output?
2. Which line of a Python traceback should you read first, and what two pieces of information does it give you?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
