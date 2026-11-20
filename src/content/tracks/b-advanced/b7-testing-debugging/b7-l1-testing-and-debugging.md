---
id: "b7-l1-testing-and-debugging"
moduleId: "b7-testing-debugging"
title: "Automated Testing, assert, pytest/unittest, and Debugging"
order: 1
estimatedMinutes: 18
difficulty: "intermediate"
objectives:
  - "Write behavior-focused assert tests covering normal and edge cases"
  - "Explain how unittest (stdlib) and pytest discover and run test suites locally"
  - "Diagnose logical bugs using tracebacks and minimal reproducible inputs"
prerequisites: ["b6-l1-type-hints-and-pep8"]
packages: []
sources: ["python-tutorial", "pyodide-docs"]
tags: ["testing", "assert", "pytest", "unittest", "debugging"]
---

## Concept

An `assert condition, "message"` statement raises `AssertionError` if `condition` is falsy [src:python-tutorial]. In local Python projects, you organize assertions into test functions using either the standard library's `unittest` module or the popular third-party `pytest` framework [src:python-tutorial]. (In PyData Path's browser runtime, our grader runs `assert`-based tests directly inside Pyodide [src:pyodide-docs].)

Good tests check **edge cases** (empty lists, zero, negative numbers, ties), not just the happy path.

Explanation: Think of `assert` tests as automated smoke detectors. Instead of re-typing manual print checks every time you edit a function, you run your tests once and immediately know if a change broke an old requirement.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Data cleaning bugs often hide in edge cases (an empty CSV, a `None` value, or a zero denominator). Writing a few tests prevents silent regressions.

## Worked example

```python
def pct_change(old, new):
    if old == 0:
        return None
    return round(((new - old) / old) * 100, 2)

assert pct_change(100, 125) == 25.0
assert pct_change(0, 50) is None
print("All checks passed!")
```

## Common mistakes

- **Using `assert` for production input validation**: Python run with `-O` (optimize) strips `assert` statements; use `if ...: raise ValueError(...)` for runtime validation and reserve `assert` for tests [src:python-tutorial].

## Check your understanding

1. Why should you test edge cases like `[]` or `0` in addition to normal inputs?
2. Why should `assert` not be used for validating external user input in production?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:pyodide-docs] Pyodide Documentation (Pyodide contributors)
