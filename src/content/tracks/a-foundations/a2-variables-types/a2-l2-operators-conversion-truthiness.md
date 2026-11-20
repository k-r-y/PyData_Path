---
id: "a2-l2-operators-conversion-truthiness"
moduleId: "a2-variables-types"
title: "Type Conversion, Operators, and Truthiness"
order: 2
estimatedMinutes: 18
difficulty: "beginner"
objectives:
  - "Use arithmetic operators including /, //, %, and **"
  - "Combine comparison and logical operators (and, or, not)"
  - "Convert values explicitly with int(), float(), str(), and bool()"
  - "Predict which values are truthy or falsy in Python"
prerequisites: ["a2-l1-variables-and-core-types"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["operators", "type-conversion", "truthiness", "is-scenario"]
---

## Concept

### Arithmetic, Comparison, and Logical Operators

Python supports standard arithmetic operators [src:python-tutorial]:
- `+`, `-`, `*`: Addition, subtraction, multiplication.
- `/`: True division, which always returns a `float` (for example, `7 / 2` is `3.5`, and `8 / 2` is `4.0`) [src:python-tutorial].
- `//`: Floor division, which discards the fractional part toward negative infinity (`7 // 2` is `3`) [src:python-tutorial].
- `%`: Modulo (remainder after division, `7 % 2` is `1`) [src:python-tutorial].
- `**`: Exponentiation (`2 ** 3` is `8`) [src:python-tutorial].

Comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`) return a `bool` (`True` or `False`) and can even be chained, such as `0 <= score <= 100` [src:python-lang-ref]. Logical operators are written as English words: `and`, `or`, and `not` (not `&&`, `||`, `!`) [src:python-lang-ref].

### Explicit Type Conversion

Because Python does not silently coerce strings to numbers in arithmetic, you convert types explicitly using built-in constructors [src:python-tutorial]:
- `int("25")` -> `25` (raises `ValueError` if the string is not a valid integer; `int(3.9)` truncates toward zero to `3`) [src:python-tutorial].
- `float("19.5")` -> `19.5` [src:python-tutorial].
- `str(42)` -> `"42"` [src:python-tutorial].
- `bool(val)` -> `True` or `False` [src:python-lang-ref].

### Truthiness

Any object in Python can be evaluated in a boolean context (`if`, `while`, `bool(x)`) [src:python-lang-ref]. By default, objects are considered **truthy**, except for a small set of **falsy** values [src:python-lang-ref]:
- `None` and `False`
- Zero of any numeric type: `0`, `0.0`
- Empty sequences and collections: `""` (empty string), `[]` (empty list), `{}` (empty dict), `set()`

Explanation: Notice that `"0"` (a string containing the character zero) is non-empty, so `bool("0")` is `True`, whereas `bool(0)` and `bool("")` are `False`. This catches many beginners off guard when reading text input or CSV fields.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

When reading data from forms, CSVs, or user input, numbers often arrive as strings (`"12"`), and missing fields arrive as `""` or `None`. Combining explicit conversion with truthiness checks lets you clean and validate records before calculating totals.

## Worked example

Here is a campus store order calculation handling string inputs, floor division for full boxes, and a truthiness check for a coupon code:

```python
raw_units = "14"
unit_price = 12.50
coupon_code = ""

units = int(raw_units)
full_boxes = units // 6          # 2 full boxes of 6
leftover = units % 6             # 2 leftover items
subtotal = units * unit_price
has_coupon = bool(coupon_code)   # False because "" is empty

print("Subtotal:", subtotal)
print("Boxes:", full_boxes, "Leftover:", leftover)
print("Coupon applied:", has_coupon)
```

## Common mistakes

- **Using `&&` or `||` from Java/JS/PHP**: Python uses `and`, `or`, `not`; `&&` causes a `SyntaxError` [src:python-lang-ref].
- **Calling `int("3.5")`**: Converting a decimal string directly with `int()` raises a `ValueError`. Convert with `float("3.5")` first if needed [src:python-tutorial].
- **Assuming `"False"` is falsy**: Because `"False"` is a non-empty string, `bool("False")` evaluates to `True` [src:python-lang-ref].

## Check your understanding

1. What is the difference between `9 / 2` and `9 // 2`?
2. Why is `bool("0")` equal to `True` while `bool(0)` is `False`?
3. Complete the exercises on the right to debug a type error, predict operator results, and compute an IS order total.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
