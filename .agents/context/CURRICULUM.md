# CURRICULUM

Each module lists topics, then required practice. All modules follow RULES.md.

## Track A: Python Foundations (beginner)
A1 Setup and first program: Python installation, running scripts, REPL, comments, print, reading error messages. Practice: first scripts, predict the output.
A2 Variables, types, operators: int, float, str, bool, None, type conversion, arithmetic and comparison, truthiness. Practice: fill blanks, debug type errors.
A3 Strings and input/output: indexing, slicing, methods, f-strings, input(). Practice: text formatting tasks, Parsons.
A4 Control flow: if, elif, else, while, for, range, break, continue. Practice: FizzBuzz variants, number guessing logic.
A5 Functions: parameters, return values, default and keyword arguments, scope, docstrings. Practice: write and test small functions.
A6 Data structures: lists, tuples, dictionaries, sets, nesting, mutability. Practice: inventory and gradebook tasks.
A7 Comprehensions, slicing, built ins: list, dict, set comprehensions, sorted, enumerate, zip, map, filter, any, all, lambda. Practice: rewrite loops as comprehensions.
A8 Errors and exceptions: try, except, else, finally, raise, common exception types, defensive input. Practice: debug exercises.
A9 Files, CSV, JSON: file modes, with statement, csv and json modules, using the in memory file system. Practice: parse and summarize a CSV with only the standard library.

## Track B: Python Intermediate and Advanced
B1 Modules, packages, environments: import system, standard library tour, venv and pip concepts (explained, since the browser cannot create real venvs). Practice: split code into modules (simulated).
B2 Object oriented programming: classes, instances, methods, inheritance, composition, dunder methods, dataclasses. Practice: model an IS entity (student, enrollment, product).
B3 Iterators and generators: iteration protocol, yield, generator expressions, itertools overview. Practice: stream processing tasks.
B4 Functions deeper: closures, decorators, functools, *args and **kwargs, higher order functions. Practice: write a timing decorator.
B5 Context managers and resource handling: with, __enter__ and __exit__, contextlib. Practice: build a simple context manager.
B6 Type hints and clean code: annotations, typing basics, PEP 8, PEP 20, naming, refactoring. Practice: refactor messy code with tests.
B7 Testing and debugging: assert based testing in app, explanation of pytest and unittest (note runtime limits), debugging strategies, reading tracebacks. Practice: write tests for a function, find bugs.
B8 Performance and algorithms basics: Big O intuition, profiling concepts, timeit, choosing data structures. Practice: compare approaches on sample data.
B9 Standard library for analysts: datetime, collections (Counter, defaultdict), statistics, random, re basics, pathlib. Practice: log parsing and text counting.

## Track C: Data Analytics with Python
C1 The analytics process: question, data, clean, analyze, communicate; types of data; data quality dimensions; ethics and privacy basics. Practice: classify datasets and frame questions.
C2 SQL with SQLite: SELECT, WHERE, ORDER BY, GROUP BY, HAVING, JOIN types, subqueries, aggregates; sqlite3 from Python. Practice: graded queries on a sample school or sales database.
C3 NumPy: arrays, shapes, indexing, broadcasting, vectorization, basic stats. Practice: replace loops with array ops.
C4 pandas basics: Series, DataFrame, reading CSV, selecting with loc and iloc, filtering, sorting, basic summaries. Practice: DataFrame lab.
C5 Data cleaning: missing values, duplicates, dtypes, string and date handling, outlier flags, validation. Practice: clean a deliberately messy synthetic dataset.
C6 Transform and combine: groupby, aggregation, merge and join, concat, pivot_table, apply, reshaping. Practice: business questions answered with grouped summaries.
C7 Time series basics: datetime index, resampling, rolling windows, trends. Practice: monthly sales trends.
C8 Visualization: chart selection, matplotlib basics, seaborn overview, labeling, misleading chart pitfalls. Practice: chart lab with target charts.
C9 Statistics fundamentals: mean, median, mode, variance, standard deviation, quantiles, distributions, correlation vs causation. Practice: simulators for distributions and correlation.
C10 Statistical inference: sampling, central limit theorem, confidence intervals, hypothesis testing, p values and their limits, effect size, common tests with scipy.stats. Practice: sampling and hypothesis simulators.
C11 Exploratory data analysis workflow: structured EDA checklist, profiling, hypotheses, documenting decisions. Practice: guided EDA project.
C12 Communicating findings: summaries for non technical readers, insights vs observations, simple dashboards concept. Practice: write a one page findings memo (stored in notes or projects).
C13 Intro to machine learning: train and test split, linear regression, classification basics, evaluation metrics, overfitting. Practice: predict a simple target and interpret results with honesty about limits.
C14 Capstone: end to end analysis from question to memo using a chosen dataset, with rubric.

## Mini projects (spread across tracks)
After A6: contact book. After A9: expense summary from CSV. After B4: logging decorator toolkit. After C6: sales performance analysis. After C10: A/B test analysis on synthetic data. Capstone after C13.