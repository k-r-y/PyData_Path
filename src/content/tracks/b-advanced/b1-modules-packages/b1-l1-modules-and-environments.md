---
id: "b1-l1-modules-and-environments"
moduleId: "b1-modules-packages"
title: "Modules, Packages, __main__, and Virtual Environments"
order: 1
estimatedMinutes: 18
difficulty: "intermediate"
objectives:
  - "Explain how Python locates modules via sys.path"
  - "Use if __name__ == '__main__': to separate reusable code from script entry points"
  - "Explain the purpose of packages (__init__.py), pip, and venv"
prerequisites: ["a9-l1-files-csv-json"]
packages: []
sources: ["python-tutorial", "python-lang-ref", "pyodide-docs"]
tags: ["modules", "packages", "venv", "pip", "__main__"]
---

## Concept

Any `.py` file is a **module**, and a directory containing modules (often with an `__init__.py` file) is a **package** [src:python-tutorial]. When you run `import my_mod`, Python searches `sys.path` (starting with the script's directory and standard library) and caches the loaded module in `sys.modules` [src:python-tutorial].

Every module has a built-in `__name__` attribute. When a file is run directly (`python my_mod.py`), `__name__` is `"__main__"`; when imported by another file, `__name__` is the module's name [src:python-tutorial]. Wrapping test or CLI code in `if __name__ == "__main__":` prevents it from running on import [src:python-tutorial].

### Virtual Environments (`venv`) and `pip`

On your local machine, different projects may need different versions of `pandas` or `scikit-learn`. A **virtual environment** (`python -m venv .venv`) creates an isolated folder of packages per project, and `pip` installs packages into that active environment [src:python-tutorial]. Note that in this browser workspace (Pyodide), packages are loaded into the browser runtime rather than a local `venv` [src:pyodide-docs].

Explanation: Think of `venv` like giving each project its own kitchen pantry so upgrading a spice in Project A never breaks a recipe in Project B.

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
