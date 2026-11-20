---
id: "a4-l1-conditionals"
moduleId: "a4-control-flow"
title: "Conditionals (if, elif, else, Nested, Ternary)"
order: 1
estimatedMinutes: 18
difficulty: "beginner"
objectives:
  - "Write mutually exclusive branches using if, elif, and else"
  - "Predict which branch executes based on condition order"
  - "Use nested conditionals and one-line conditional expressions cleanly"
  - "Avoid common syntax and logic bugs in conditional chains"
prerequisites: ["a3-l2-fstrings-and-input"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["control-flow", "if", "elif", "else", "conditionals"]
---

## Concept

### 1. Basic `if`, `elif`, and `else`

An `if` statement evaluates a condition and runs its indented block only when that condition is truthy [src:python-tutorial]. You can chain zero or more `elif` ("else if") branches and an optional `else` fallback [src:python-tutorial].

```python
score = 82
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
print(grade)  # B
```

Explanation: Think of an `if / elif / else` chain like a stack of sieves. Python checks conditions from top to bottom and executes **only the first matching branch**, skipping the rest [src:python-tutorial]. That is why stricter or more specific conditions must come before broader ones.

### 2. Nested Conditionals vs Compound Conditions

You can place an `if` inside another `if` (nested conditional) when a second check only makes sense after the first passes, or combine conditions with `and` / `or` to keep nesting shallow [src:python-lang-ref].

```python
is_member = True
order_total = 65.0

if is_member:
    if order_total >= 50:
        print("Free shipping unlocked")
```

Explanation: Deeply nested `if` blocks are harder to read. Whenever two checks are independent, `if is_member and order_total >= 50:` is flatter and clearer.

### 3. Conditional Expression (Ternary Operator)

For simple two-way assignments, Python offers a one-line conditional expression: `value_if_true if condition else value_if_false` [src:python-lang-ref].

```python
stock = 0
label = "In Stock" if stock > 0 else "Out of Stock"
print(label)  # Out of Stock
```

Explanation: Unlike Java/JS (`cond ? a : b`), Python puts the true value *first* so it reads like English: `"In Stock" if stock > 0 else "Out of Stock"`.

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

## Common mistakes

- **Using `=` instead of `==` in a condition**: `if stock = 0:` is a `SyntaxError` in Python; equality comparison uses `==` [src:python-tutorial].
- **Writing `else if` instead of `elif`**: Unlike Java, PHP, and JavaScript, Python requires the single keyword `elif` [src:python-tutorial].
- **Checking a broader condition before a stricter one**: `if score >= 60:` before `elif score >= 90:` catches `95` in the first branch so `>= 90` never runs.

## Check your understanding

1. In an `if / elif / else` chain, how many branches can execute on a single pass?
2. How is Python's one-line conditional expression ordered compared to JavaScript's `? :`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
