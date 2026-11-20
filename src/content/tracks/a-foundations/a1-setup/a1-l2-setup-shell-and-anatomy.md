---
id: "a1-l2-setup-shell-and-anatomy"
moduleId: "a1-setup"
title: "Setup, Shell Commands, REPL, and Program Anatomy"
order: 2
estimatedMinutes: 20
difficulty: "beginner"
objectives:
  - "Use standard Python shell commands for running scripts, modules, and managing packages"
  - "Navigate the interactive REPL (>>>, ..., _) compared to running a .py file"
  - "Identify every part of a Python program's anatomy: shebang, docstring, imports, comments, statements, and indentation"
  - "Use import, from ... import, and import ... as to load standard library and third-party tools"
prerequisites: ["a1-l1-what-is-python"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pep8", "pyodide-docs"]
tags: ["setup", "shell", "repl", "imports", "anatomy"]
---

## Concept

### 1. Python Shell Commands and Local Setup

On your own computer, you interact with Python through a terminal (shell) [src:python-tutorial]. Common commands include:
- `python3 --version` (or `python --version` / `py --version` on Windows): Prints the installed Python version [src:python-tutorial].
- `python3 script.py`: Executes a saved `.py` file from top to bottom [src:python-tutorial].
- `python3 -c "print(2 + 2)"`: Runs a short one-line command directly from the shell [src:python-tutorial].
- `python3 -i script.py`: Runs `script.py` and then drops you into the interactive prompt so you can inspect variables [src:python-tutorial].
- `python3 -m pip install pandas`: Runs `pip` as a module to install third-party packages from PyPI [src:python-tutorial].
- `python3 -m venv .venv`: Creates an isolated virtual environment folder per project [src:python-tutorial].

```text
# Run these in your OS terminal (not inside a .py file):
python3 --version
python3 -m venv .venv
python3 -m pip install pandas
python3 analyze_sales.py
```

Explanation: In PyData Path, your code runs inside **Pyodide** (CPython in WebAssembly inside a browser Web Worker) rather than your computer's OS shell, so `pip` and `venv` are handled by the app's package loader instead [src:pyodide-docs].

### 2. The Interactive REPL (`>>>`, `...`, and `_`)

Running `python3` with no filename starts the **REPL** (Read-Eval-Print Loop) [src:python-tutorial]:
- `>>>` is the primary prompt waiting for a statement or expression.
- `...` is the continuation prompt when writing multi-line blocks (like `if` or `for`).
- `_` holds the result of the last evaluated expression in the REPL.
- Type `exit()` or press `Ctrl+D` (macOS/Linux) or `Ctrl+Z` + Enter (Windows) to quit.

```text
>>> 15 * 1.12
16.8
>>> _ + 2
18.8
```

Explanation: Notice that in the REPL, typing `15 * 1.12` prints `16.8` automatically, whereas in a `.py` script file you must call `print(15 * 1.12)` to see output.

### 3. Anatomy of a Python Program

A well-structured Python script follows a consistent top-to-bottom anatomy [src:pep8]:
1. **Module docstring** (optional `"""..."""` at the top describing the script's purpose).
2. **Imports** grouped at the top (standard library first, third-party second, local modules third) [src:pep8].
3. **Constants** in `UPPER_SNAKE_CASE` (e.g., `TAX_RATE = 0.12`).
4. **Comments** starting with `#` (ignored by Python, written for humans) [src:python-tutorial].
5. **Expressions** (evaluate to a value, e.g., `2 + 3`) and **statements** (perform an action, e.g., `x = 2 + 3`) [src:python-lang-ref].
6. **Indentation** (4 spaces per level) to define blocks [src:pep8].

```python
"""Compute campus store tax."""      # 1. Module docstring
import math                         # 2. Import
TAX_RATE = 0.12                     # 3. Constant

# Calculate total with ceiling      # 4. Comment
raw_total = 100 * (1 + TAX_RATE)    # 5. Statement with expression
if raw_total > 100:                 # 6. Indented block (4 spaces)
    print(math.ceil(raw_total))
```

### 4. Three Ways to `import` Packages and Modules

Python includes a rich **Standard Library** ("batteries included") and supports third-party packages [src:python-tutorial]:
- `import math`: Loads the module; access items with `math.sqrt(16)`.
- `from statistics import median`: Binds `median` directly into your namespace; call `median([1, 2, 3])`.
- `import statistics as stats`: Binds a short alias (`import pandas as pd`, `import numpy as np`).

```python
import math
from statistics import median
import statistics as stats

print(math.sqrt(16), median([1, 5, 3]), stats.mean([2, 4]))
```

Explanation: Avoid `from math import *` (wildcard imports), because dumping every name from a module into your namespace makes it unclear where functions came from and risks overwriting existing names [src:pep8].

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Knowing the difference between OS shell commands (`python3 script.py`), the interactive REPL (`>>>`), and `.py` files prevents one of the most common beginner mistakes: typing shell commands like `pip install` inside a Python script.

## Worked example

```python
import math
from statistics import mean

scores = [84, 90, 78, 92]
average_score = mean(scores)
rounded_up = math.ceil(average_score)

print("Average:", average_score)
print("Rounded up:", rounded_up)
```

## Common mistakes

- **Running `pip install` inside Python code**: `pip` is a terminal command, not valid Python syntax [src:python-tutorial].
- **Forgetting the module prefix**: If you write `import math`, calling `sqrt(16)` fails with a `NameError`; call `math.sqrt(16)` unless you used `from math import sqrt` [src:python-tutorial].

## Check your understanding

1. Which terminal command starts an interactive Python REPL, and which one runs a saved file?
2. Why does PEP 8 discourage `from module import *`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pep8] PEP 8 - Style Guide for Python Code (Guido van Rossum et al.)
- [src:pyodide-docs] Pyodide Documentation (Pyodide contributors)
