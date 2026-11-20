---
id: "a1-l1-what-is-python"
moduleId: "a1-setup"
title: "What Is Python, How It Works, and Where It Fits"
order: 1
estimatedMinutes: 12
difficulty: "beginner"
objectives:
  - "Describe Python's background and core design philosophy"
  - "Explain how CPython turns .py source code into bytecode and executes it"
  - "Compare Python's typing and execution model to Java, PHP, and JavaScript"
  - "Identify major real-world domains where Python is used"
prerequisites: []
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep20", "pyodide-docs"]
tags: ["python-basics", "interpreter", "bytecode", "background"]
---

## Concept

Python is a high-level, general-purpose programming language created by Guido van Rossum in the late 1980s and first released in 1991 [src:python-tutorial]. Its name comes from the comedy group Monty Python rather than the snake [src:python-tutorial]. Today the language is stewarded by the Python Software Foundation [src:python-tutorial].

At its core, Python is an **interpreted, dynamically typed** language [src:python-tutorial]. When you run a `.py` file using the standard CPython implementation, Python does not compile directly to native machine code ahead of time like C or C++. Instead, CPython compiles your source code into an intermediate representation called **bytecode** (often cached in `__pycache__` as `.pyc` files) and executes that bytecode inside the Python Virtual Machine (PVM) [src:python-lang-ref].

Explanation: Think of CPython like a kitchen translator. You write a recipe in clean English (`.py` source code). Before cooking, the translator quickly rewrites the recipe into short, standardized kitchen shorthand (`.pyc` bytecode) so the chef (the Python Virtual Machine) can execute each step line by line without re-reading the raw text every time.

Because Python is dynamically typed, variables do not have fixed types declared in the code; instead, values carry their types at runtime [src:python-lang-ref]. Python also uses **indentation** (whitespace at the start of a line) rather than curly braces `{}` to define code blocks [src:python-tutorial]. Its guiding design principles, recorded in PEP 20 ("The Zen of Python"), emphasize readability and simplicity [src:pep20].

### How Python Relates to Java, PHP, and JavaScript

| Feature | Python | Java | PHP | JavaScript |
| --- | --- | --- | --- | --- |
| Typing | Dynamic, strong | Static, strong | Dynamic, weak/gradual | Dynamic, weak |
| Execution | Source -> bytecode -> PVM | Source -> bytecode -> JVM | Interpreted/JIT (Zend) | JIT compiled (V8, etc.) |
| Code blocks | Indentation (4 spaces) | Curly braces `{}` | Curly braces `{}` | Curly braces `{}` |
| Semicolons | Optional, rarely used | Required | Required | Optional (ASI) |
| Primary strengths | Data analytics, AI, automation, backends | Enterprise backends, Android | Server-side web | Browser UI, Node.js backends |

Explanation: If you have used Java, you are used to writing `int count = 5;` and wrapping blocks in `{ }`. In Python, you write `count = 5` and indent the next lines instead of using braces. Compared to PHP and JavaScript, Python is stricter about mixing incompatible types automatically (for example, `"5" + 2` raises an error in Python instead of silently converting types).

### Where Python Is Used

- **Data analytics and data science**: Cleaning tabular data, running statistical tests, and building charts with libraries such as pandas, NumPy, and Matplotlib [src:pandas-docs].
- **Machine learning and AI**: Training predictive models and neural networks [src:sklearn-docs].
- **Web backends and APIs**: Server-side applications and data pipelines [src:python-tutorial].
- **Automation and scripting**: File processing, report generation, and system tasks [src:automate-boring-stuff].

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Understanding how Python executes code helps you predict why errors happen when they do. In statically typed languages like Java, many type mismatches are caught before the program runs. In Python, syntax errors are caught when compiling to bytecode, while type errors and undefined names are caught only when that specific line executes [src:python-lang-ref].

## Worked example

You can inspect Python's own design philosophy and runtime environment directly from Python code using built-in modules like `sys` [src:python-tutorial].

```python
import sys

# Print the Python version running in this browser sandbox
print("Python version:", sys.version.split()[0])

# Dynamic typing: the same variable name can hold different types of values
enrollment_count = 42
print("Count:", enrollment_count, type(enrollment_count))

enrollment_count = "forty-two"
print("Count:", enrollment_count, type(enrollment_count))
```

Notice there are no semicolons, no type declarations, and `import sys` loads a built-in module from the Python Standard Library [src:python-tutorial].

## Common mistakes

- **Mixing tabs and spaces**: Python relies on consistent indentation. Mixing tab characters and spaces in the same block raises a `TabError` [src:python-lang-ref].
- **Expecting silent type coercion**: Coming from PHP or JavaScript, `"10" + 5` does not become `"105"` or `15` in Python; it raises a `TypeError` because Python does not implicitly convert between `str` and `int` [src:python-lang-ref].
- **Forgetting that errors can hide in unexecuted branches**: Because Python checks types at runtime, a type bug inside an `if` branch will not trigger until that branch actually runs [src:python-lang-ref].

## Check your understanding

1. In your own words, what is the difference between `.py` source code and `.pyc` bytecode?
2. Why does `"5" + 3` fail in Python when similar expressions work in JavaScript or PHP?
3. Try the exercises on the right to inspect `sys.platform` and practice dynamic variable assignment.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep20] PEP 20 - The Zen of Python (Tim Peters)
- [src:pyodide-docs] Pyodide Documentation (Pyodide contributors)
- [src:pandas-docs] pandas Documentation
- [src:sklearn-docs] scikit-learn User Guide
- [src:automate-boring-stuff] Automate the Boring Stuff with Python (Al Sweigart)
