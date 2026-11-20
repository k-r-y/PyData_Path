---
id: "a3-l2-fstrings-and-input"
moduleId: "a3-strings-io"
title: "f-Strings, Format Mini-Language, and input()"
order: 2
estimatedMinutes: 18
difficulty: "beginner"
objectives:
  - "Format strings cleanly using f-strings (f\"...\") and debug expressions (f\"{x=}\")"
  - "Apply numeric and alignment specifiers such as :.2f, :,, :.1%, :<10, and :>8"
  - "Read user input with input() and convert it to int or float when needed"
prerequisites: ["a3-l1-indexing-slicing-methods"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["f-strings", "formatting", "input", "io"]
---

## Concept

### 1. Formatted String Literals (f-strings) and Format Specifiers

An **f-string** starts with `f` (or `F`) before the opening quote and embeds Python expressions inside `{}` [src:python-tutorial]. Add a colon `:` followed by a format specifier to control decimals, thousands separators, percentages, and column alignment [src:python-tutorial]:
- `f"{val:.2f}"`: Fixed 2 decimal places (`19.5` -> `"19.50"`).
- `f"{val:,}"`: Thousands separator (`12500` -> `"12,500"`).
- `f"{ratio:.1%}"`: Multiplies by 100 and appends `%` (`0.845` -> `"84.5%"`).
- `f"{label:<10}"` / `f"{num:>8}"`: Left- or right-aligns in a fixed width.
- `f"{total=}"`: Debug shorthand printing `total=123`.

```python
item, revenue, margin = "USB-C Hub", 12500.5, 0.245
print(f"{item:<12} | ${revenue:>10,.2f} | {margin:.1%}")
```

Explanation: `:,.2f` combines `,` (thousands separator) with `.2f` (fixed 2 decimal places), while `<12` and `>10` align text and numbers into neat table columns.

### 2. Reading User Input With `input()`

The built-in `input(prompt)` function displays an optional prompt, waits for a line of text, and **always returns a `str`** [src:python-tutorial]. Convert with `int()` or `float()` before doing arithmetic [src:python-tutorial].

```python
# In a local terminal, input() waits for the user to type.
# In PyData Path exercises, test inputs are supplied automatically.
raw = "4"
qty = int(raw)
print(qty * 12.50)  # 50.0
```

Explanation: Think of `input()` as a microphone that always records text: even if someone types `42`, Python hands you `"42"` (`str`), so convert it before multiplying or adding.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Cleanly formatted reports (currency to 2 decimal places, aligned columns, readable summaries) are how analytics scripts communicate results to stakeholders.

## Worked example

```python
item_name = "USB-C Hub"
qty = 3
unit_price = 24.50

total = qty * unit_price
print(f"Item: {item_name} | Qty: {qty} | Total: ${total:,.2f}")
```

## Common mistakes

- **Forgetting the `f` prefix**: Writing `"Total: {total}"` without `f` prints the literal braces `{total}` [src:python-tutorial].
- **Doing math directly on `input()`**: `qty = input(); qty * 10` repeats the string 10 times (`"4444..."`) instead of multiplying numbers [src:python-tutorial].

## Check your understanding

1. What does `f"{0.256:.1%}"` produce?
2. What data type does `input("Enter age: ")` return if the user types `21`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
