---
id: "b6-l1-type-hints-and-pep8"
moduleId: "b6-type-hints-and-pep8"
title: "Type Hints, PEP 8, and Refactoring"
order: 1
estimatedMinutes: 18
difficulty: "intermediate"
objectives:
  - "Annotate functions and variables using Python type hints (int, str, list[int], dict[str, float], int | None)"
  - "Explain that type hints are not enforced at runtime by default"
  - "Apply PEP 8 naming and formatting conventions when refactoring"
prerequisites: ["b5-l1-context-managers"]
packages: []
sources: ["python-tutorial", "pep8", "pep20"]
tags: ["typing", "type-hints", "pep8", "pep20", "refactoring"]
---

## Concept

Type hints annotate expected types on parameters, return values, and variables [src:python-tutorial]:

```python
def mean_score(scores: list[int]) -> float | None:
    if not scores:
        return None
    return sum(scores) / len(scores)
```

Python's runtime **does not enforce** type hints automatically [src:python-tutorial]; they exist for human readability, IDE autocomplete, and static type checkers like `mypy` or `pyright`.

PEP 8 recommends [src:pep8]:
- `snake_case` for functions and variables, `PascalCase` for classes, `UPPER_CASE` for constants.
- 4 spaces per indent, max line length around 79-99 characters, and clear spacing around operators.

Explanation: Think of type hints as nutrition labels on food packages: they do not stop you from eating something unexpected, but they tell everyone reading the code (and your editor) exactly what goes in and what comes out.

Note: Behavior may differ between versions. Check the official docs for your installed version (for example, `list[int]` and `int | None` require Python 3.9+ / 3.10+).

## Why it matters

Clean, type-annotated functions make codebases dramatically easier to maintain and debug as analytics projects grow.

## Worked example

```python
def summarize_orders(totals: list[float], tax_rate: float = 0.12) -> dict[str, float]:
    net = sum(totals)
    return {"net": round(net, 2), "with_tax": round(net * (1 + tax_rate), 2)}

print(summarize_orders([100.0, 50.0]))
```

## Common mistakes

- **Assuming type hints raise `TypeError` at runtime**: Calling `add(1, "2")` on `def add(a: int, b: int) -> int:` still runs until the `+` operator fails; Python itself ignores annotations at execution time [src:python-tutorial].

## Check your understanding

1. Does Python raise an error at runtime if you pass a `str` to a parameter annotated as `int`?
2. What naming style does PEP 8 recommend for constants vs classes?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
- [src:pep20] PEP 20 - The Zen of Python (Tim Peters)
