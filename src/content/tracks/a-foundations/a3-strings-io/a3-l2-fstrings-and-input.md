---
id: "a3-l2-fstrings-and-input"
moduleId: "a3-strings-io"
title: "f-Strings, Formatting, and input()"
order: 2
estimatedMinutes: 16
difficulty: "beginner"
objectives:
  - "Format strings cleanly using f-strings (f\"...\")"
  - "Apply numeric format specifiers such as :.2f and :,"
  - "Read user input with input() and convert it to int or float when needed"
prerequisites: ["a3-l1-indexing-slicing-methods"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["f-strings", "formatting", "input", "io"]
---

## Concept

### Formatted String Literals (f-strings)

An **f-string** starts with `f` (or `F`) before the opening quote and lets you embed Python expressions inside curly braces `{}` [src:python-tutorial]. You can also add a colon `:` followed by a format specifier inside `{}` to control decimals, commas, or alignment [src:python-tutorial]:

- `f"{price:.2f}"`: Formats a number with exactly 2 decimal places (for example, `19.5` -> `"19.50"`).
- `f"{revenue:,}"`: Inserts thousands separators (`12500` -> `"12,500"`).
- `f"{label:<12}"`: Left-aligns `label` in a 12-character field.

### Reading User Input with `input()`

The built-in `input(prompt)` function displays an optional prompt, waits for a line of text, and **always returns a `str`** [src:python-tutorial]. Even if the user types `42`, `input()` returns `"42"`, so you must wrap it in `int()` or `float()` before doing arithmetic [src:python-tutorial].

Note: In PyData Path's browser sandbox, exercises that use `input()` supply test values automatically rather than popping up a terminal prompt. In a local terminal, `input()` pauses and waits for you to type and press Enter.

Explanation: Think of `input()` as a microphone that always records text. If someone speaks a number into it, Python still hands you a `str`, and it is your job to convert it with `int()` or `float()` before calculating.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Cleanly formatted reports (currency to 2 decimal places, aligned columns, readable summaries) are how analytics scripts communicate results to stakeholders.

## Worked example

```python
item_name = "USB-C Hub"
qty = int(input("Quantity: "))
unit_price = float(input("Unit price: "))

total = qty * unit_price
print(f"Item: {item_name} | Qty: {qty} | Total: ${total:,.2f}")
```

If the inputs are `"3"` and `"24.5"`, the output is `Item: USB-C Hub | Qty: 3 | Total: $73.50`.

## Common mistakes

- **Forgetting the `f` prefix**: Writing `"Total: {total}"` without `f` prints the literal braces `{total}` instead of the variable's value [src:python-tutorial].
- **Doing math directly on `input()`**: `qty = input("Qty: "); total = qty * 10` repeats the string 10 times (for example, `"3333333333"`) instead of multiplying numbers! Always convert with `int()` or `float()` [src:python-tutorial].
- **Using quotes inside f-strings that match the outer quotes (older Python)**: In Python 3.12+, reusing the same quote type inside `{...}` is allowed, whereas older Python versions require alternating single and double quotes [src:python-lang-ref].

## Check your understanding

1. What does `f"{45.5:.2f}"` produce?
2. What data type does `input("Enter age: ")` return if the user types `21`?
3. Complete the exercises on the right to debug an `input()` bug, reorder a Parsons problem, and build a formatted IS receipt.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
