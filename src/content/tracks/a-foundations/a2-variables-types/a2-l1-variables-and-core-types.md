---
id: "a2-l1-variables-and-core-types"
moduleId: "a2-variables-types"
title: "Variables and Core Data Types (int, float, str, bool, None)"
order: 1
estimatedMinutes: 15
difficulty: "beginner"
objectives:
  - "Follow Python variable naming rules and PEP 8 snake_case conventions"
  - "Distinguish int, float, str, bool, and None values"
  - "Inspect types at runtime using type() and isinstance()"
  - "Check for None safely using the is operator"
prerequisites: ["a1-l3-first-program-and-errors"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["variables", "types", "int", "float", "str", "bool", "None"]
---

## Concept

In Python, a variable is a name bound to an object in memory [src:python-lang-ref]. Variable names may contain letters, digits, and underscores (`_`), cannot start with a digit, and are case-sensitive (`total` and `Total` are different names) [src:python-lang-ref]. PEP 8 recommends `snake_case` (lowercase words separated by underscores) for variable names [src:pep8].

Python's five foundational built-in scalar/null types are [src:python-tutorial]:

- `int`: Whole numbers of arbitrary precision (for example, `42`, `-7`, `0`, `1_000_000`) [src:python-tutorial].
- `float`: Decimal numbers represented in binary floating-point (for example, `3.14`, `-0.5`, `2.0`) [src:python-tutorial]. Note that some base-10 decimals like `0.1 + 0.2` have tiny binary rounding differences (`0.30000000000000004`) [src:python-tutorial].
- `str`: Immutable sequences of Unicode characters enclosed in single (`'...'`) or double (`"..."`) quotes [src:python-tutorial].
- `bool`: Logical truth values `True` and `False` (note the capital `T` and `F`) [src:python-lang-ref].
- `None`: The sole value of `NoneType`, used to represent the intentional absence of a value [src:python-lang-ref].

You can inspect an object's type with `type(value)` or test whether it belongs to a type with `isinstance(value, expected_type)` [src:python-tutorial]. To test whether a variable is `None`, PEP 8 specifies using `x is None` or `x is not None` rather than `==` [src:pep8].

Explanation: Think of a variable like a sticky note attached to a box. The box itself has a type (such as `int` or `str`), while the sticky note is just the name pointing to it. Moving the sticky note to a different box changes what the name refers to.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

In data analytics, misidentified column types are a top source of silent bugs: a ZIP code or student ID stored as an `int` loses leading zeros, while a price stored as a `str` cannot be summed until converted. Knowing the core types lets you spot and prevent these issues early.

## Worked example

```python
student_id = "2026-00412"     # str: keeps leading zeros and hyphen
units_enrolled = 18            # int: whole number
gpa = 3.75                     # float: decimal number
is_full_time = True            # bool: True or False
graduation_date = None         # NoneType: not yet assigned

print(type(student_id), isinstance(units_enrolled, int))
print("Has graduation date:", graduation_date is not None)
```

Notice that `student_id` is stored as a `str` rather than an `int` because it is an identifier, not a quantity you do arithmetic on.

## Common mistakes

- **Using lowercase `true`, `false`, or `null`**: Python requires capitalized `True`, `False`, and `None` (unlike Java, PHP, or JavaScript) [src:python-lang-ref].
- **Comparing `float` values with `==` after arithmetic**: `0.1 + 0.2 == 0.3` evaluates to `False` due to binary floating-point representation [src:python-tutorial].
- **Using `== None` instead of `is None`**: While `==` often works, custom objects can override `==`, so PEP 8 recommends `is None` [src:pep8].

## Check your understanding

1. Why should a phone number or student ID with leading zeros be stored as `str` instead of `int`?
2. What does `type(3.0)` return?
3. Complete the exercises on the right to practice filling in type checks, predicting float behavior, and writing variable definitions.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
