---
id: "b2-l1-classes-and-dataclasses"
moduleId: "b2-oop"
title: "Classes, Methods, Inheritance, and Dataclasses"
order: 1
estimatedMinutes: 22
difficulty: "intermediate"
objectives:
  - "Define classes with __init__, instance attributes, and methods"
  - "Implement dunder methods such as __repr__ for readable debugging"
  - "Compare inheritance (is-a) vs composition (has-a)"
  - "Use @dataclass to reduce boilerplate on data-holding classes"
prerequisites: ["b1-l1-modules-and-environments"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8"]
tags: ["oop", "class", "dataclass", "dunder", "inheritance"]
---

## Concept

A `class` bundles data (attributes) and behavior (methods) into a blueprint [src:python-tutorial]. Every instance method receives the instance itself as its first parameter, conventionally named `self` [src:python-tutorial]. The `__init__` method initializes new instances, and `__repr__` defines a developer-friendly string representation [src:python-lang-ref].

### Inheritance vs Composition and `@dataclass`

- **Inheritance** (`class GradStudent(Student):`) lets a subclass reuse and override parent behavior [src:python-tutorial].
- **Composition** stores another object as an attribute (for example, an `Order` has a list of `OrderItem` objects) and is often simpler and more flexible than deep inheritance trees.
- **`@dataclass`** (from `dataclasses`) automatically generates `__init__`, `__repr__`, and `__eq__` for classes whose main job is holding data [src:python-tutorial].

Explanation: If you know Java classes, Python's `self` is like Java's `this`, except Python passes `self` explicitly in the method signature `def enroll(self, course):`.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Modeling IS entities (`Student`, `Course`, `Product`, `Invoice`) with clean classes or `@dataclass` objects keeps business rules encapsulated and easy to test.

## Worked example

```python
from dataclasses import dataclass

@dataclass
class Product:
    sku: str
    name: str
    stock: int

    def restock(self, qty: int) -> None:
        self.stock += qty

item = Product("SKU-10", "Mouse", 5)
item.restock(10)
print(item)
```

## Common mistakes

- **Forgetting `self` in a method definition**: Writing `def restock(qty):` inside a class raises a `TypeError` when called on an instance (`item.restock(10)`) [src:python-tutorial].
- **Using mutable class attributes**: Defining `items = []` directly on the class body shares one list across *all* instances; initialize per-instance lists inside `__init__` (or use `field(default_factory=list)` in `@dataclass`) [src:python-tutorial].

## Check your understanding

1. What is the role of `self` in a Python class method?
2. Which three methods does `@dataclass` generate automatically?
3. Complete the exercises on the right to model an IS `Enrollment` entity.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
