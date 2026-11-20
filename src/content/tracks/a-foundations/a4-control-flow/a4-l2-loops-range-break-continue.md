---
id: "a4-l2-loops-range-break-continue"
moduleId: "a4-control-flow"
title: "Loops (for, while, range, break, continue)"
order: 2
estimatedMinutes: 18
difficulty: "beginner"
objectives:
  - "Iterate over sequences and number ranges using for and range()"
  - "Write condition-controlled loops using while without creating infinite loops"
  - "Control loop flow using break and continue"
prerequisites: ["a4-l1-conditionals"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["loops", "for", "while", "range", "break", "continue"]
---

## Concept

### `for` Loops and `range()`

A `for` loop iterates over the items of any sequence (such as a `str` or `list`) in order [src:python-tutorial]. When you need to loop a specific number of times, use the built-in `range()` function [src:python-tutorial]:
- `range(5)` yields `0, 1, 2, 3, 4` (stops **before** `5`).
- `range(1, 6)` yields `1, 2, 3, 4, 5` (includes `1`, excludes `6`).
- `range(0, 10, 2)` yields `0, 2, 4, 6, 8` (step of `2`).

### `while` Loops

A `while` loop repeats as long as its condition remains truthy [src:python-tutorial]. You must update a variable inside the loop body so the condition eventually becomes `False`; otherwise the loop runs forever (an infinite loop).

### `break` and `continue`

- `break`: Exits the innermost `for` or `while` loop immediately [src:python-tutorial].
- `continue`: Skips the rest of the current iteration and jumps straight to the next iteration [src:python-tutorial].

Explanation: Think of `for` as walking through every item on a checklist, `while` as waiting at a traffic light until it turns green, `break` as walking out of the store early once you find what you need, and `continue` as skipping one damaged item on a conveyor belt and moving to the next.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Loops let you process hundreds of rows, scan records until a match is found (`break`), skip invalid entries (`continue`), and automate repetitive calculations.

## Worked example

Here is a FizzBuzz-style IS audit tagger for transaction IDs `1` through `10` (checking divisibility by both `3` and `5` first):

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

- **Off-by-one with `range(1, 10)`**: `range(1, 10)` stops at `9`, not `10`. Use `range(1, 11)` to include `10` [src:python-tutorial].
- **Checking `% 3` before `% 3 and % 5` in FizzBuzz**: Just like in Lesson 1, the combined condition (`% 15 == 0`) must come first, or multiples of 15 will be caught by `% 3`!
- **Infinite `while` loop**: Forgetting `count += 1` inside `while count < 5:` causes the loop to run until the 10-second worker timeout stops it.

## Check your understanding

1. What numbers does `range(2, 10, 3)` generate?
2. What is the difference between `break` and `continue`?
3. Complete the exercises on the right to debug a `while` loop, predict `break`/`continue`, and implement a FizzBuzz variant.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
