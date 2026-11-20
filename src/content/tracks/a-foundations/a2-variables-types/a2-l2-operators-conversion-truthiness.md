---
id: "a2-l2-operators-conversion-truthiness"
moduleId: "a2-variables-types"
title: "Type Conversion, Operators, Precedence, and Truthiness"
order: 2
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Use arithmetic operators (/, //, %, **) and augmented assignment (+=, *=)"
  - "Combine comparison and logical operators (and, or, not) with short-circuiting"
  - "Convert values explicitly with int(), float(), str(), and bool()"
  - "Predict which values are truthy or falsy in Python"
prerequisites: ["a2-l1-variables-and-core-types"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["operators", "type-conversion", "truthiness", "is-scenario"]
---

## Concept

### 1. Arithmetic, Augmented Assignment, and Precedence

Python supports `+`, `-`, `*`, plus four essential operators [src:python-tutorial]:
- `/`: True division, always returning a `float` (`8 / 2` -> `4.0`).
- `//`: Floor division, returning the whole quotient rounded down (`7 // 2` -> `3`).
- `%`: Modulo (remainder, `7 % 2` -> `1`).
- `**`: Exponentiation (`2 ** 3` -> `8`).

Precedence follows PEMDAS (`**` before `* / // %` before `+ -`), and augmented assignments (`count += 1`, `total *= 1.12`) update a variable concisely [src:python-lang-ref].

```python
total = 100
total *= 1.12
print(total, 29 // 6, 29 % 6)  # 112.0 4 5
```

Explanation: Use `//` and `%` together whenever splitting items into fixed-size packs (`29 // 6` full boxes, `29 % 6` leftover items).

### 2. Comparison, Logical (`and`, `or`, `not`), and Identity (`is`)

Comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`) return a `bool` and can be chained (`0 <= score <= 100`) [src:python-lang-ref]. Logical operators (`and`, `or`, `not`) **short-circuit**, stopping as soon as the outcome is known [src:python-lang-ref]. Use `==` for value equality and `is` for object identity (chiefly `is None`).

```python
score = 85
print(0 <= score <= 100 and score >= 75)  # True
```

### 3. Explicit Type Conversion

Convert types explicitly using `int()`, `float()`, `str()`, and `bool()` [src:python-tutorial]. Note that `int(3.9)` truncates toward zero (`3`), whereas `int("3.9")` raises `ValueError`.

```python
raw_qty = "14"
total = int(raw_qty) * float("12.50")
print("Total: $" + str(total))  # Total: $175.0
```

### 4. Truthiness

Any object can be tested in a boolean context (`if`, `while`, `bool(x)`) [src:python-lang-ref]. Falsy values are `None`, `False`, `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `()`; everything else is truthy [src:python-lang-ref].

```python
print(bool(0), bool(""), bool("0"), bool([1]))  # False False True True
```

Explanation: `"0"` (a string containing the character zero) is non-empty, so `bool("0")` is `True`, whereas `bool(0)` and `bool("")` are `False`.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

When reading data from forms, CSVs, or user input, numbers often arrive as strings (`"12"`), and missing fields arrive as `""` or `None`. Combining explicit conversion with truthiness checks lets you clean and validate records before calculating totals.

## Worked example

```python
raw_units = "14"
unit_price = 12.50
coupon_code = ""

units = int(raw_units)
full_boxes = units // 6
leftover = units % 6
subtotal = units * unit_price
has_coupon = bool(coupon_code)

print("Subtotal:", subtotal, "| Boxes:", full_boxes, "| Leftover:", leftover, "| Coupon:", has_coupon)
```

## Common mistakes

- **Using `&&` or `||` from Java/JS/PHP**: Python uses `and`, `or`, `not`; `&&` causes a `SyntaxError` [src:python-lang-ref].
- **Calling `int("3.5")`**: Converting a decimal string directly with `int()` raises a `ValueError`; use `float("3.5")` [src:python-tutorial].

## Check your understanding

1. What is the difference between `9 / 2` and `9 // 2`?
2. Why is `bool("0")` equal to `True` while `bool(0)` is `False`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
