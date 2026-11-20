---
id: "a4-l2-loops-range-break-continue"
moduleId: "a4-control-flow"
title: "All Loops (for, while, range, nested, loop-else, break, continue)"
order: 2
estimatedMinutes: 24
difficulty: "beginner"
objectives:
  - "Iterate over sequences (lists, strings, dicts) using for loops"
  - "Generate numeric sequences with range(stop), range(start, stop), and range(start, stop, step)"
  - "Write condition-controlled while loops without creating infinite loops"
  - "Use nested loops, break, continue, pass, and loop else clauses appropriately"
prerequisites: ["a4-l1-conditionals"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["loops", "for", "while", "range", "nested-loops", "break", "continue"]
---

## Concept

Python has two primary loop statements (`for` and `while`), plus loop-control keywords (`break`, `continue`, `pass`) and an optional `else` clause [src:python-tutorial].

### 1. `for` Loops Over Sequences

A `for` loop steps through every item in an iterable (such as a `list`, `str`, `tuple`, or `dict`) in order [src:python-tutorial].

```python
courses = ["IS-101", "IS-204", "IS-301"]
for code in courses:
    print("Course:", code)
```

Explanation: Unlike C or Java's index-based `for (int i = 0; i < n; i++)`, Python's `for` loop directly hands you each element one by one, making code cleaner and preventing off-by-one index bugs.

### 2. `for` Loops With `range()`

When you need to repeat an action a fixed number of times or step through numbers, use `range()` [src:python-tutorial]:
- `range(5)` yields `0, 1, 2, 3, 4` (starts at `0`, stops **before** `5`).
- `range(1, 6)` yields `1, 2, 3, 4, 5` (includes `1`, excludes `6`).
- `range(10, 0, -2)` yields `10, 8, 6, 4, 2` (negative step counts down).

```python
for step in range(1, 4):
    print(f"Batch {step}")
```

Explanation: Think of `range(start, stop, step)` as a lazy number generator: it remembers only where it starts, where it stops, and how big each step is, without building a giant list in memory.

### 3. `while` Loops

A `while` loop repeats as long as its condition remains truthy [src:python-tutorial]. Use `while` when you do not know ahead of time how many iterations are needed (for example, halving a value until it drops below a threshold, or retrying until valid input arrives).

```python
stock = 20
days = 0
while stock > 5:
    stock -= 4
    days += 1
print(f"Reached low stock in {days} days (remaining: {stock})")
```

Explanation: Always ask "what inside the `while` body moves the condition closer to `False`?" If nothing changes the condition variable, the loop runs forever (an infinite loop).

### 4. Nested Loops

Placing one loop inside another lets you process 2D grids, combinations, or grouped records [src:python-tutorial]. The inner loop completes all its iterations for *each* single iteration of the outer loop.

```python
regions = ["North", "South"]
quarters = ["Q1", "Q2"]
for r in regions:
    for q in quarters:
        print(f"{r}-{q}")
```

Explanation: Think of a clock's hour and minute hands: for every 1 step of the outer loop (hour), the inner loop (minute) completes a full cycle.

### 5. `break`, `continue`, `pass`, and Loop `else`

- `break`: Exits the innermost loop immediately [src:python-tutorial].
- `continue`: Skips the rest of the current iteration and jumps to the next iteration [src:python-tutorial].
- `pass`: A no-op placeholder when syntax requires an indented block [src:python-tutorial].
- `for ... else:` / `while ... else:`: The `else` block runs **only if the loop finished normally without hitting `break`** [src:python-tutorial].

```python
target = 42
for num in [10, 25, 30]:
    if num == target:
        print("Found!")
        break
else:
    print("Not found in list")
```

Explanation: The `else` on a loop is really "no-break": it is handy for search loops so you do not need a separate `found = False` flag variable.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Loops automate repetitive work across rows of data, search for anomalies (`break`), skip invalid records (`continue`), and build summary tables across multiple dimensions (nested loops).

## Worked example

Here is a FizzBuzz-style IS audit tagger for transaction IDs `1` through `10`:

```python
for tx_id in range(1, 11):
    if tx_id % 3 == 0 and tx_id % 5 == 0:
        tag = "Audit+Alert"
    elif tx_id % 3 == 0:
        tag = "Audit"
    elif tx_id % 5 == 0:
        tag = "Alert"
    else:
        tag = str(tx_id)
    print(tag)
```

## Common mistakes

- **Off-by-one with `range(1, 10)`**: `range(1, 10)` stops at `9`, not `10` [src:python-tutorial].
- **Infinite `while` loop**: Forgetting to update the loop variable inside `while` freezes execution until the worker timeout stops it.
- **Modifying a list while looping over it**: Adding or removing items from the same list you are iterating over skips elements; iterate over a copy or build a new list [src:python-tutorial].

## Check your understanding

1. When should you use a `for` loop vs a `while` loop?
2. When does the `else` block of a `for ... else` loop execute?
3. Complete the exercises on the right covering `while`, `for`/`range`, nested loops, `break`/`continue`, and FizzBuzz.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
