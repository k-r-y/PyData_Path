---
id: "b2-l1-classes-and-dataclasses"
moduleId: "b2-oop"
title: "Classes, Methods, Inheritance, and Dataclasses"
order: 1
estimatedMinutes: 24
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

### 1. Classes, `__init__`, `self`, and Methods

A `class` bundles data (attributes) and behavior (methods) into a blueprint [src:python-tutorial]. Every instance method receives the instance itself as its first parameter, conventionally named `self` [src:python-tutorial]. The `__init__` method initializes new instances.

```python
class Course:
    def __init__(self, code, capacity):
        self.code = code
        self.capacity = capacity
        self.enrolled = 0

    def enroll_one(self):
        if self.enrolled < self.capacity:
            self.enrolled += 1

c = Course("IS-301", 40)
c.enroll_one()
print(c.code, c.enrolled)  # IS-301 1
```

Explanation: If you know Java classes, Python's `self` is like Java's `this`, except Python lists `self` explicitly as the first parameter in every instance method definition.

### 2. Dunder Methods (`__repr__`, `__eq__`)

Special methods with double underscores ("dunder" methods) customize how objects behave with built-in functions like `repr()`, `print()`, and `==` [src:python-lang-ref].

```python
class Tag:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"Tag({self.name!r})"

print(Tag("IS"))  # Tag('IS')
```

Explanation: Without `__repr__`, printing an object shows an unhelpful memory address like `<Tag object at 0x...>`. Defining `__repr__` makes debugging and logs readable.

### 3. Inheritance vs Composition

- **Inheritance** (`class GradStudent(Student):`) lets a subclass reuse and extend a parent class using `super()` [src:python-tutorial].
- **Composition** stores another object as an attribute (for example, an `Order` *has* a list of `OrderItem` objects) [src:python-tutorial].

```python
class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, major):
        super().__init__(name)
        self.major = major

s = Student("Ana", "IS")
print(s.name, s.major)
```

Explanation: Prefer composition ("has-a") when combining independent parts, and inheritance ("is-a") when a specialized type genuinely extends a base type.

### 4. `@dataclass`

`@dataclass` (from `dataclasses`) automatically generates `__init__`, `__repr__`, and `__eq__` from type-annotated fields [src:python-tutorial].

```python
from dataclasses import dataclass

@dataclass
class Product:
    sku: str
    name: str
    stock: int = 0

p = Product("SKU-10", "Mouse", 5)
print(p)  # Product(sku='SKU-10', name='Mouse', stock=5)
```

Explanation: `@dataclass` removes repetitive `self.x = x` boilerplate when a class's main job is holding structured data.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Modeling IS entities (`Student`, `Course`, `Product`, `Invoice`) with clean classes or `@dataclass` objects keeps business rules encapsulated and easy to test.

## Worked example

```python
from dataclasses import dataclass

@dataclass
class ProductItem:
    sku: str
    name: str
    stock: int

    def restock(self, qty: int) -> None:
        self.stock += qty

item = ProductItem("SKU-10", "Mouse", 5)
item.restock(10)
print(item)
```

## Common mistakes

- **Forgetting `self` in a method definition**: Writing `def restock(qty):` inside a class raises a `TypeError` when called on an instance (`item.restock(10)`) [src:python-tutorial].
- **Using mutable class attributes**: Defining `items = []` directly on the class body shares one list across *all* instances; initialize per-instance lists inside `__init__` (or use `field(default_factory=list)` in `@dataclass`) [src:python-tutorial].

## Check your understanding

1. What is the role of `self` in a Python class method?
2. Which three methods does `@dataclass` generate automatically?
3. Complete the exercises on the right to model an IS `Student` entity.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
