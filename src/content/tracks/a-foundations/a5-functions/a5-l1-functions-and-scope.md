---
id: "a5-l1-functions-and-scope"
moduleId: "a5-functions"
title: "Defining Functions, Arguments, Return Values, and Scope"
order: 1
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Define functions with def, parameters, and return statements"
  - "Use positional, keyword, and default arguments safely"
  - "Distinguish local vs global variable scope"
  - "Document functions using PEP 8 / PEP 257 docstrings"
prerequisites: ["a4-l2-loops-range-break-continue"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["functions", "def", "return", "scope", "docstrings"]
---

## Concept

A function is a reusable named block defined with `def` [src:python-tutorial]. Functions accept inputs through **parameters**, optionally send a result back with `return`, and return `None` by default if no `return` statement executes [src:python-tutorial].

### Arguments and Defaults

When calling a function, you can pass **positional arguments** (matched by order) or **keyword arguments** (matched by parameter name, such as `tax_rate=0.12`) [src:python-tutorial]. Parameters can also define **default values** (`def calc_total(price, tax_rate=0.12):`) [src:python-tutorial]. Always use immutable defaults like `None` or numbers rather than mutable objects like `[]`, because default values are evaluated once when `def` runs [src:python-tutorial].

### Scope and Docstrings

Variables assigned inside a function belong to its **local scope** and disappear when the function finishes; variables defined at the top level belong to **global scope** [src:python-lang-ref]. A string literal as the first statement inside `def` is a **docstring**, describing what the function does [src:python-tutorial].

Explanation: Think of a function like a coffee machine: parameters are the ingredients you put in, local variables are the internal gears, and `return` is the cup that comes out. Printing inside a function only shows text on a screen; `return` actually hands the value back to the caller so it can be stored or tested.

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

- **Using `print()` instead of `return`**: Calling `total = my_func()` when `my_func` only prints results sets `total` to `None` [src:python-tutorial].
- **Mutable default arguments**: Writing `def add_item(item, items=[]):` shares the same list across calls; use `items=None` and create `[]` inside the function instead [src:python-tutorial].

## Check your understanding

1. What does a function return if it has no `return` statement?
2. Why should you avoid `items=[]` as a default parameter?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
