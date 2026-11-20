---
id: "b1-l1-modules-and-environments"
moduleId: "b1-modules-packages"
title: "Modules, Packages, __main__, and Virtual Environments"
order: 1
estimatedMinutes: 20
difficulty: "intermediate"
objectives:
  - "Explain how Python locates modules via sys.path and caches them in sys.modules"
  - "Use if __name__ == '__main__': to separate reusable code from script entry points"
  - "Explain the purpose of packages (__init__.py), pip, and venv"
prerequisites: ["a9-l1-files-csv-json"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pyodide-docs"]
tags: ["modules", "packages", "venv", "pip", "__main__"]
---

## Concept

### 1. Modules and `sys.path`

Any `.py` file is a **module**, and a directory containing modules (often with an `__init__.py` file) is a **package** [src:python-tutorial]. When you run `import my_mod`, Python searches `sys.path` (starting with the script's directory, then standard library, then installed `site-packages`) and caches the loaded module in `sys.modules` [src:python-tutorial].

```python
import sys
print("First search path:", repr(sys.path[0]))
print("math cached?", "math" in sys.modules)
```

Explanation: Because Python caches imported modules in `sys.modules`, importing the same module in three different files only executes its top-level code once.

### 2. The `if __name__ == "__main__":` Guard

Every module has a built-in `__name__` attribute. When a file is run directly (`python my_mod.py`), `__name__` is `"__main__"`; when imported by another file, `__name__` is the module's name [src:python-tutorial].

```python
def add_vat(amount, rate=0.12):
    return round(amount * (1 + rate), 2)

if __name__ == "__main__":
    # Runs only when executed directly, not on import
    print(add_vat(100))
```

Explanation: Think of `if __name__ == "__main__":` as a "front door" switch: if you run the file yourself, the test/demo runs; if another script imports `add_vat`, it gets only the function without unwanted print output.

### 3. Virtual Environments (`venv`) and `pip`

On your local machine, different projects may need different versions of `pandas` or `scikit-learn`. A **virtual environment** (`python -m venv .venv`) creates an isolated folder of packages per project, and `pip` installs packages into that active environment [src:python-tutorial]. Note that in this browser workspace (Pyodide), packages are loaded into the browser runtime rather than a local `venv` [src:pyodide-docs].

```text
# Local terminal workflow (run in OS shell, not in Python):
python3 -m venv .venv
source .venv/bin/activate     # macOS/Linux (Windows: .venv\Scripts\activate)
python -m pip install pandas
```

Explanation: Think of `venv` like giving each project its own kitchen pantry so upgrading a package in Project A never breaks Project B.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Splitting analytics code into clean modules and isolating dependencies with `venv` are essential for reproducible portfolios and team projects.

## Worked example

```python
# Simulate writing a module into Pyodide's in-memory filesystem and importing it
with open("tax_utils.py", "w", encoding="utf-8") as f:
    f.write("def add_vat(amount, rate=0.12):\n    return round(amount * (1 + rate), 2)\n")

import tax_utils
print(tax_utils.add_vat(100))
```

## Common mistakes

- **Shadowing standard library names**: Naming your file `random.py` or `csv.py` causes `import random` to import *your* file instead of Python's standard library [src:python-tutorial].
- **Installing packages globally without activating `venv`**: Always activate your virtual environment before running `pip install` [src:python-tutorial].

## Check your understanding

1. What is `__name__` set to when a module is imported vs executed directly?
2. Why should you avoid naming a script `json.py`?
3. Complete the exercises on the right.

## Sources

- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
- [src:python-lang-ref] The Python Language Reference (Python Software Foundation)
- [src:pyodide-docs] Pyodide Documentation (Pyodide contributors)
