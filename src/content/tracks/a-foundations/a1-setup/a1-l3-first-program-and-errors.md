---
id: "a1-l3-first-program-and-errors"
moduleId: "a1-setup"
title: "First Program, print(), and Reading Error Messages"
order: 3
estimatedMinutes: 15
difficulty: "beginner"
objectives:
  - "Use print() with multiple arguments, sep, and end"
  - "Read a Python traceback from bottom to top to locate errors"
  - "Distinguish SyntaxError, NameError, and TypeError"
prerequisites: ["a1-l2-setup-shell-and-anatomy"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["print", "errors", "traceback", "debugging"]
---

## Concept

The built-in `print()` function writes text to standard output [src:python-tutorial]. You can pass one or more values separated by commas, and Python converts each value to text and joins them with a space by default [src:python-tutorial].

Two optional keyword arguments control formatting [src:python-tutorial]:
- `sep`: The separator placed between multiple arguments (default is `" "`).
- `end`: The string printed at the end (default is `"\n"`, a newline).

### Reading Python Error Messages (Tracebacks)

When Python cannot parse or run your code, it prints a **traceback** [src:python-tutorial]. Always read a traceback from the **bottom line up**:
1. **Last line**: Shows the exception type (such as `SyntaxError`, `NameError`, or `TypeError`) and a short description [src:python-tutorial].
2. **Line above it**: Shows the file name and line number where Python detected the problem [src:python-tutorial].

- `SyntaxError`: Python could not parse your code structure (for example, a missing quote or unclosed parenthesis) [src:python-tutorial].
- `NameError`: You used a variable or function name that has not been defined in scope [src:python-lang-ref].
- `TypeError`: You applied an operation to an incompatible type (for example, `"Units: " + 15`) [src:python-lang-ref].

Explanation: Think of a traceback like a receipt from a failed delivery. The bottom line tells you *why* the package could not be delivered (`NameError`), and the line right above it tells you *which address* (line number) had the problem.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Every programmer encounters errors daily. Learning to read the bottom line of a traceback calmly turns cryptic red text into exact debugging instructions.

## Worked example

Here is a small Information Systems enrollment summary script using `print()` with `sep` and `end`:

```python
course_code = "IS-301"
enrolled = 38
capacity = 40

print("Course", course_code, sep=": ")
print("Enrolled:", enrolled, "of", capacity)
print("2026", "11", "19", sep="-")
```

Notice that `print("Course", course_code, sep=": ")` outputs `Course: IS-301`, and `print("2026", "11", "19", sep="-")` outputs `2026-11-19`.

## Common mistakes

- **Using `+` to join strings and numbers**: `print("Enrolled: " + 38)` raises a `TypeError`. Either pass them as separate comma-separated arguments `print("Enrolled:", 38)` or convert the number with `str(38)` [src:python-tutorial].
- **Forgetting quotes around text**: `print(Hello)` treats `Hello` as a variable name and raises a `NameError` [src:python-tutorial].
- **Misreading SyntaxError line numbers**: If you forget a closing parenthesis `)` on line 3, Python may report the `SyntaxError` on line 4 [src:python-tutorial].

## Check your understanding

1. What does `print("A", "B", "C", sep="-")` output?
2. Which line of a Python traceback should you read first, and what two pieces of information does it give you?
3. Complete the exercises on the right to format an IS inventory report and fix a buggy script.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
