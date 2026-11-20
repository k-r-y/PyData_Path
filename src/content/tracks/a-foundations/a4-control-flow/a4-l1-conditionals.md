---
id: "a4-l1-conditionals"
moduleId: "a4-control-flow"
title: "Conditionals (if, elif, else)"
order: 1
estimatedMinutes: 15
difficulty: "beginner"
objectives:
  - "Write mutually exclusive branches using if, elif, and else"
  - "Predict which branch executes based on condition order"
  - "Avoid common syntax and logic bugs in conditional chains"
prerequisites: ["a3-l2-fstrings-and-input"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["control-flow", "if", "elif", "else", "conditionals"]
---

## Concept

An `if` statement evaluates a condition and runs its indented block only when that condition is truthy [src:python-tutorial]. You can chain zero or more `elif` ("else if") branches and an optional `else` fallback [src:python-tutorial].

Key rules of `if / elif / else` [src:python-lang-ref]:
- Every `if`, `elif`, and `else` header ends with a colon `:`.
- The body of each branch is indented by 4 spaces (per PEP 8) [src:pep8].
- Python checks conditions from top to bottom and executes **only the first matching branch**, skipping the rest [src:python-tutorial].

Python also supports a one-line conditional expression (`value_if_true if condition else value_if_false`) for simple assignments [src:python-lang-ref].

Explanation: Think of an `if / elif / else` chain like a series of sieves stacked vertically. Once a value passes through the first matching sieve, it leaves the chain and never reaches the `elif` or `else` sieves below it. That is why ordering conditions from most specific to most general matters.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Business rules in Information Systems (discount tiers, credit approval, inventory reorder alerts, grading scales) are expressed as conditional logic. Getting branch order wrong can silently misclassify records.

## Worked example

Here is an IS inventory reorder classifier that checks from most urgent (`<= 0`) to normal stock:

```python
stock = 4

if stock <= 0:
    status = "OUT_OF_STOCK"
elif stock < 10:
    status = "LOW_STOCK"
else:
    status = "OK"

print(f"Stock: {stock} -> {status}")
```

Because `4 <= 0` is `False` and `4 < 10` is `True`, `status` becomes `"LOW_STOCK"` and the `else` branch is skipped.

## Common mistakes

- **Using `=` instead of `==` in a condition**: `if stock = 0:` is a `SyntaxError` in Python; equality comparison uses `==` [src:python-tutorial].
- **Writing `else if` instead of `elif`**: Unlike Java, PHP, and JavaScript, Python requires the single keyword `elif` [src:python-tutorial].
- **Checking a broader condition before a stricter one**: If you check `if score >= 60` before `if score >= 90`, a score of `95` matches the first branch and never reaches the `90` branch.
- **Using independent `if` statements when you meant `elif`**: Two separate `if` statements can *both* run, whereas `if / elif` guarantees at most one branch runs [src:python-tutorial].

## Check your understanding

1. In an `if / elif / else` chain, how many branches can execute on a single pass?
2. Why does `if x > 5:` followed by `elif x > 10:` never reach the `elif` branch?
3. Complete the exercises on the right to practice predicting branches, ordering a Parsons conditional, and building an IS stock classifier.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
