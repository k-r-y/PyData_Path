---
id: "a6-l1-lists-tuples-dicts-sets"
moduleId: "a6-data-structures"
title: "Lists, Tuples, Dictionaries, Sets, and Mutability"
order: 1
estimatedMinutes: 22
difficulty: "beginner"
objectives:
  - "Choose appropriately between list, tuple, dict, and set"
  - "Perform common operations: append, pop, get, keys/values/items, set membership"
  - "Work with nested structures such as a list of dictionaries"
  - "Distinguish mutable vs immutable collections"
prerequisites: ["a5-l1-functions-and-scope"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["lists", "tuples", "dicts", "sets", "mutability"]
---

## Concept

Python provides four built-in collection types [src:python-tutorial]:
- `list` (`[1, 2, 3]`): Ordered, **mutable** sequence. Supports `.append()`, `.extend()`, `.pop()`, indexing, and slicing [src:python-tutorial].
- `tuple` (`(1, 2)`): Ordered, **immutable** sequence, often used for fixed records or returning multiple values [src:python-tutorial].
- `dict` (`{"sku": "A1", "qty": 5}`): Key-value mapping where keys are unique and hashable. Use `d.get(key, default)` to look up keys safely without raising `KeyError` [src:python-tutorial].
- `set` (`{"a", "b"}`): Unordered collection of unique elements, ideal for deduplication and fast `in` membership tests [src:python-tutorial].

Explanation: Think of a `list` as a numbered shopping cart you can add/remove items from, a `tuple` as a sealed receipt, a `dict` as a contact book mapping names to details, and a `set` as a guest list where duplicates are automatically removed.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Before loading data into pandas, APIs and JSON files represent records as lists of dictionaries (`[{"id": 1, "score": 90}, ...]`). Mastering these four structures makes data wrangling natural.

## Worked example

```python
contacts = [
    {"name": "Ana", "dept": "IS"},
    {"name": "Ben", "dept": "CS"},
    {"name": "Cara", "dept": "IS"},
]

depts = {c["dept"] for c in contacts}
print("Unique departments:", depts)
print("First contact:", contacts[0].get("name"))
```

## Common mistakes

- **Using `{}` for an empty set**: `{}` creates an empty `dict`; use `set()` for an empty set [src:python-tutorial].
- **Aliasing a mutable list with `b = a`**: Both `a` and `b` point to the same list in memory. Modifying `b` mutates `a`; use `b = a.copy()` when you need an independent copy [src:python-tutorial].

## Check your understanding

1. How do you create an empty set vs an empty dictionary?
2. Why is `d.get("missing", 0)` safer than `d["missing"]`?
3. Complete the exercises on the right, including the Contact Book mini-project task.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
