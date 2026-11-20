---
id: "a1-l2-setup-shell-and-anatomy"
moduleId: "a1-setup"
title: "Setup, Shell Commands, REPL, and Program Anatomy"
order: 2
estimatedMinutes: 15
difficulty: "beginner"
objectives:
  - "Recognize standard Python shell commands for running scripts and managing packages"
  - "Describe how the interactive REPL works compared to running a .py file"
  - "Identify the core parts of a Python program: imports, comments, statements, and indentation"
  - "Use import, from ... import, and import ... as to load standard library tools"
prerequisites: ["a1-l1-what-is-python"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8", "pyodide-docs"]
tags: ["setup", "shell", "repl", "imports", "anatomy"]
---

## Concept

When working outside this browser app on your own computer, you interact with Python through a terminal (shell) [src:python-tutorial].

### Common Python Shell Commands

- `python --version` or `python3 --version`: Checks the installed Python version (on macOS and Linux, the command is often `python3`; on Windows it is often `python` or `py`) [src:python-tutorial].
- `python script.py`: Executes a Python source file from top to bottom [src:python-tutorial].
- `python` (with no filename): Starts the **REPL** (Read-Eval-Print Loop), an interactive prompt marked by `>>>` where each line runs immediately and prints its result [src:python-tutorial].
- `python -m pip install pandas`: Runs `pip` as a module to install third-party packages from PyPI [src:python-tutorial].
- `python -m venv .venv`: Creates an isolated virtual environment folder so one project's package versions do not clash with another's [src:python-tutorial].

Note: In PyData Path, your code runs inside **Pyodide** (Python compiled to WebAssembly inside a browser Web Worker) rather than your computer's OS shell, so `pip` and `venv` are not used directly here [src:pyodide-docs].

### Anatomy of a Python Program

A typical Python script is structured from top to bottom with four building blocks:

1. **Imports**: Usually placed at the top of the file [src:pep8]. You can import an entire module (`import math`), a specific item (`from math import sqrt`), or assign an alias (`import math as m`) [src:python-tutorial].
2. **Comments**: Anything after `#` on a line is ignored by Python and is written for humans [src:python-tutorial].
3. **Statements and expressions**: An expression evaluates to a value (like `2 + 3`), while a statement performs an action (like `total = 2 + 3` or `print(total)`) [src:python-lang-ref].
4. **Indentation**: PEP 8 recommends 4 spaces per indentation level to define blocks inside `if`, `for`, or `def` [src:pep8].

Explanation: Think of `import` like opening a toolbox before starting a repair. The Python Standard Library comes with dozens of built-in toolboxes (`math`, `statistics`, `csv`, `json`, `datetime`), and external packages like `pandas` are extra toolboxes you install when doing analytics.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Knowing the difference between shell commands (`python3 script.py`), the interactive REPL (`>>>`), and `.py` files prevents one of the most common beginner mistakes: typing shell commands like `pip install` inside a Python script or inside the `>>>` prompt.

## Worked example

```python
# 1. Imports at the top of the script
import math
from statistics import mean

# 2. Variables and expressions
scores = [84, 90, 78, 92]
average_score = mean(scores)
rounded_up = math.ceil(average_score)

# 3. Output statement
print("Average:", average_score)
print("Rounded up:", rounded_up)
```

Notice how `import math` requires `math.ceil(...)`, whereas `from statistics import mean` lets you call `mean(...)` directly [src:python-tutorial].

## Common mistakes

- **Running `pip install` inside Python code**: `pip` is a terminal command, not valid Python syntax. Running `pip install pandas` inside a `.py` file causes a `SyntaxError` [src:python-tutorial].
- **Forgetting the module prefix**: If you write `import math`, calling `sqrt(16)` fails with a `NameError`; you must call `math.sqrt(16)` unless you used `from math import sqrt` [src:python-tutorial].
- **Leading whitespace on top-level lines**: Starting a top-level line with an accidental space causes an `IndentationError` [src:python-lang-ref].

## Check your understanding

1. Which terminal command starts an interactive Python REPL, and which one runs a saved file?
2. What is the difference between `import math` and `from math import sqrt`?
3. Complete the two import and anatomy exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
- [src:pyodide-docs] Pyodide Documentation (Pyodide contributors)
