---
id: "a2-l1-variables-and-core-types"
moduleId: "a2-variables-types"
title: "Variables and Core Data Types (int, float, str, bool, None)"
order: 1
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Follow Python variable naming rules, reserved keywords, and PEP 8 snake_case"
  - "Distinguish int, float, str, bool, and None values"
  - "Inspect types and identity using type(), isinstance(), and is"
  - "Check for None safely using is None"
prerequisites: ["a1-l3-first-program-and-errors"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["variables", "types", "int", "float", "str", "bool", "None"]
---

## Concept

### 1. Variable Binding, Naming Rules, and Reserved Keywords

In Python, a variable is a name bound to an object in memory (`=` is binding, not a fixed memory box) [src:python-lang-ref]. Variable names may contain letters, digits, and underscores (`_`), cannot start with a digit, cannot be a reserved keyword (`if`, `for`, `class`, `None`), and are case-sensitive [src:python-lang-ref]. PEP 8 recommends `snake_case` for variable names [src:pep8].

```python
total_units = 12
unit_price = 4.50
a = b = 0  # Multiple assignment
x, y = 10, 20  # Tuple unpacking assignment
print(total_units, unit_price, x, y)
```

Explanation: Think of a variable like a sticky note attached to an object. The object has a type (`int`, `str`), while the sticky note is just the name pointing to it.

### 2. Numeric Types: `int` and `float`

- `int`: Whole numbers of **arbitrary precision** (Python integers never overflow; underscores like `1_000_000` improve readability) [src:python-tutorial].
- `float`: IEEE 754 binary floating-point decimals (`3.14`, `2.0`, `1e-3`) [src:python-tutorial]. Because base-10 decimals like `0.1` cannot be represented exactly in binary, `0.1 + 0.2` equals `0.30000000000000004`; use `round()` or `math.isclose()` for comparisons [src:python-tutorial].

```python
import math
qty = 1_000_000
print(math.isclose(0.1 + 0.2, 0.3))  # True
```

### 3. Text (`str`), Booleans (`bool`), and `None`

- `str`: Immutable Unicode text (`'IS-301'` or `"IS-301"`, or triple-quoted `"""..."""` for multi-line) [src:python-tutorial].
- `bool`: Logical `True` and `False` (capitalized; `bool` is a subclass of `int`, where `True == 1` and `False == 0`) [src:python-lang-ref].
- `None`: The sole value of `NoneType`, representing the intentional absence of a value. Always check with `x is None` or `x is not None` per PEP 8 [src:pep8].

```python
discount = None
is_active = True
print(discount is None, isinstance(is_active, bool), isinstance(is_active, int))  # True True True
```

Explanation: Use `type(val)` to inspect the exact class and `isinstance(val, expected_type)` to check type compatibility (including subclasses).

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

In data analytics, misidentified column types are a top source of silent bugs: a ZIP code or student ID stored as an `int` loses leading zeros, while a price stored as a `str` cannot be summed until converted.

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

## Common mistakes

- **Using lowercase `true`, `false`, or `null`**: Python requires capitalized `True`, `False`, and `None` [src:python-lang-ref].
- **Comparing `float` values with `==` after arithmetic**: `0.1 + 0.2 == 0.3` evaluates to `False`; use `math.isclose()` [src:python-tutorial].

## Check your understanding

1. Why should a phone number or student ID with leading zeros be stored as `str` instead of `int`?
2. What does `type(3.0)` return?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
