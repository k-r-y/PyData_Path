---
id: "a6-l1-lists-tuples-dicts-sets"
moduleId: "a6-data-structures"
title: "Lists, Tuples, Dictionaries, Sets, and Mutability"
order: 1
estimatedMinutes: 28
difficulty: "beginner"
objectives:
  - "Choose appropriately between list, tuple, dict, and set"
  - "Use core methods: append, extend, pop, copy, get, items, setdefault, add, discard"
  - "Work with nested structures such as a list of dictionaries"
  - "Distinguish mutable vs immutable collections and shallow copy vs aliasing"
prerequisites: ["a5-l1-functions-and-scope"]
packages: []
sources: ["python-tutorial", "python-lang-ref"]
tags: ["lists", "tuples", "dicts", "sets", "mutability"]
---

## Concept

### 1. Lists (`list`): Ordered, Mutable, and Aliasing vs Copying

A `list` (`[1, 2, 3]`) is an ordered, **mutable** sequence [src:python-tutorial]. Key methods: `.append(x)` (add 1 item), `.extend(seq)` (add multiple items), `.insert(i, x)`, `.pop(i)` (remove and return), `.remove(val)`, and `.copy()` [src:python-tutorial].

```python
a = [10, 20]
b = a           # Aliasing: b points to the SAME list
c = a.copy()    # Shallow copy: c is a separate list
b.append(30)
print("a:", a, "c:", c)  # a: [10, 20, 30] c: [10, 20]
```

Explanation: Because lists are mutable, `b = a` creates two names for the *same* list in memory. Use `.copy()` (or `copy.deepcopy()` for nested lists) when you need an independent copy.

### 2. Tuples (`tuple`): Ordered, Immutable, and Unpacking

A `tuple` (`(1, 2)`) is an ordered, **immutable** sequence [src:python-tutorial]. Note that a 1-element tuple requires a trailing comma: `(42,)`. Tuples can be unpacked (including `*rest` for remaining items) and can serve as `dict` keys because they are hashable [src:python-tutorial].

```python
record = ("IS-301", 38, 40, "Active")
code, enrolled, *rest = record
print(code, enrolled, rest)  # IS-301 38 [40, 'Active']
```

Explanation: Use a `tuple` for fixed records (coordinates, RGB colors, database rows) where accidental modification should be prevented.

### 3. Dictionaries (`dict`): Key-Value Mappings

A `dict` (`{"sku": "A1", "qty": 5}`) maps unique, hashable keys to values and preserves insertion order [src:python-tutorial]. Key methods: `.get(k, default)`, `.setdefault(k, default)`, `.update(other)`, `.pop(k)`, `.keys()`, `.values()`, and `.items()` [src:python-tutorial].

```python
stock = {"SKU-1": 12, "SKU-2": 0}
print(stock.get("SKU-3", 0))  # 0 (no KeyError)
for sku, qty in stock.items():
    print(sku, "->", qty)
```

Explanation: Think of a `dict` like a contact book or lookup index: instead of searching by numeric position `0, 1, 2`, you jump straight to a record by its key name in `O(1)` average time.

### 4. Sets (`set`): Unique Elements & Set Algebra

A `set` (`{"IS", "CS"}`) stores unique, hashable elements and supports fast `in` membership tests plus union (`|`), intersection (`&`), difference (`-`), and symmetric difference (`^`) [src:python-tutorial]. Use `set()` (not `{}`) for an empty set, `.add(x)`, and `.discard(x)` (safe remove without `KeyError`) [src:python-tutorial].

```python
enrolled = {"Ana", "Ben", "Cara"}
submitted = {"Ana", "Cara", "Dan"}
print("Missing:", enrolled - submitted)      # {'Ben'}
print("Both:", enrolled & submitted)         # {'Ana', 'Cara'}
```

Explanation: Think of a `set` as a guest list where duplicates are automatically removed and comparing two groups takes a single `-` or `&` operator.

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
- **Aliasing a mutable list with `b = a`**: Modifying `b` mutates `a`; use `b = a.copy()` [src:python-tutorial].

## Check your understanding

1. How do you create a 1-element tuple and an empty set?
2. Why is `d.get("missing", 0)` safer than `d["missing"]`?
3. Complete the exercises on the right, including the Contact Book mini-project task.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
