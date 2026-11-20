---
id: "a5-l1-functions-and-scope"
moduleId: "a5-functions"
title: "Defining Functions, Arguments, Return Values, and LEGB Scope"
order: 1
estimatedMinutes: 25
difficulty: "beginner"
objectives:
  - "Define functions with def, parameters, and return statements"
  - "Use positional, keyword, and default arguments safely (avoiding mutable defaults)"
  - "Return and unpack multiple values from a function"
  - "Explain Python's LEGB scope resolution rule and write PEP 257 docstrings"
prerequisites: ["a4-l2-loops-range-break-continue"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["functions", "def", "return", "scope", "docstrings"]
---

## Concept

### 1. Defining Functions and `return` vs `print()`

A function is a reusable named block defined with `def` [src:python-tutorial]. Functions accept inputs through **parameters**, send a result back with `return`, and implicitly return `None` if no `return` executes [src:python-tutorial]. Calling `return` exits the function immediately.

```python
def add_tax(price):
    return round(price * 1.12, 2)

final_price = add_tax(100)
print(final_price)  # 112.0
```

Explanation: Think of a function like a coffee machine: parameters are the ingredients you put in, and `return` is the cup that comes out. Using `print()` inside a function only displays text on the screen; `return` hands the value back so your program can store or test it.

### 2. Positional, Keyword, and Default Arguments

When calling a function, pass **positional arguments** (matched by order) before **keyword arguments** (matched by name) [src:python-tutorial]. Parameters can define **default values**, which Python evaluates **once** at `def` time [src:python-tutorial].

```python
def calc_total(price, qty=1, tax_rate=0.12):
    return round(price * qty * (1 + tax_rate), 2)

print(calc_total(50))                    # uses qty=1, tax_rate=0.12
print(calc_total(50, 3, tax_rate=0.0))   # positional + keyword
```

Explanation: Never use a mutable object like `[]` or `{}` as a default parameter (`def add(x, items=[])`), because all calls would share the exact same list! Use `items=None` and initialize `if items is None: items = []` inside the function.

### 3. Returning Multiple Values

A function can return multiple values separated by commas, which Python packs into a `tuple` that the caller can unpack [src:python-tutorial].

```python
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([12, 45, 7, 30])
print(f"Low: {low}, High: {high}")
```

### 4. Scope (LEGB Rule) and Docstrings

Python resolves variable names using the **LEGB** rule [src:python-lang-ref]:
1. **L**ocal (inside the current `def`)
2. **E**nclosing (outer `def` in nested functions)
3. **G**lobal (module top-level)
4. **B**uilt-in (`len`, `print`, `sum`)

A string literal as the first statement inside `def` is a **docstring**, accessible via `func.__doc__` or `help(func)` [src:python-tutorial].

```python
rate = 0.10  # Global

def compute_fee(amount):
    """Return the service fee for a given amount."""
    fee = amount * rate  # Reads Global 'rate'; 'fee' is Local
    return fee

print(compute_fee(200), "|", compute_fee.__doc__)
```

Explanation: Functions can *read* global variables, but assigning `rate = 0.20` inside a function creates a separate local variable `rate` rather than changing the global one. Avoid mutating globals from inside functions; pass values in as parameters and `return` results instead.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Reusable functions keep analytics scripts organized, testable, and free of duplicated logic.

## Worked example

```python
def calculate_net_pay(hours, rate=250.0, tax_rate=0.10):
    """Return net pay after applying the given tax rate."""
    gross = hours * rate
    return round(gross * (1 - tax_rate), 2)

print(calculate_net_pay(8))
print(calculate_net_pay(8, tax_rate=0.05))
```

## Common mistakes

- **Using `print()` instead of `return`**: Calling `total = my_func()` when `my_func` only prints sets `total` to `None` [src:python-tutorial].
- **Mutable default arguments**: `def add_item(item, items=[]):` shares one list across calls; use `items=None` instead [src:python-tutorial].

## Check your understanding

1. What does LEGB stand for when Python looks up a variable name?
2. Why should you avoid `items=[]` as a default parameter?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
