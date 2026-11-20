---
id: "c2-l1-sql-and-sqlite3"
moduleId: "c2-sql-sqlite"
title: "SQL Queries and sqlite3 in Python"
order: 1
estimatedMinutes: 22
difficulty: "intermediate"
objectives:
  - "Filter and sort rows using SELECT, WHERE, and ORDER BY"
  - "Aggregate groups using GROUP BY, COUNT/SUM/AVG, and HAVING"
  - "Combine tables using INNER JOIN and LEFT JOIN"
  - "Run parameterized SQLite queries safely from Python using sqlite3"
prerequisites: ["c1-l1-analytics-lifecycle"]
packages: []
sources: ["sqlite-docs", "python-tutorial"]
tags: ["sql", "sqlite3", "join", "groupby"]
---

## Concept

SQL (Structured Query Language) retrieves and aggregates data from relational tables [src:sqlite-docs]. Core clauses execute logically in this order:
1. `FROM` / `JOIN`: Identify and combine tables (`INNER JOIN` keeps matches in both; `LEFT JOIN` keeps all left rows).
2. `WHERE`: Filter individual rows **before** grouping.
3. `GROUP BY`: Group rows by column(s) and compute `COUNT()`, `SUM()`, `AVG()`.
4. `HAVING`: Filter **grouped** results after aggregation.
5. `SELECT` / `ORDER BY` / `LIMIT`: Choose output columns and sort.

In Python, the built-in `sqlite3` module runs SQLite databases in memory (`sqlite3.connect(":memory:")`) or from `.db` files [src:python-tutorial]. Always pass user values via `?` placeholders (`cur.execute("SELECT * FROM t WHERE id = ?", (val,))`) to prevent SQL injection [src:python-tutorial].

Explanation: Remember `WHERE` vs `HAVING` by timing: `WHERE` filters raw rows *before* you group them into buckets; `HAVING` filters the *buckets themselves* after `GROUP BY`.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Most enterprise IS data lives in relational databases. Extracting clean aggregated tables with SQL before loading into pandas saves memory and time.

## Worked example

```python
import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE sales (region TEXT, amount REAL)")
cur.executemany("INSERT INTO sales VALUES (?, ?)", [("North", 100), ("North", 50), ("South", 40)])

rows = cur.execute(
    "SELECT region, SUM(amount) FROM sales GROUP BY region HAVING SUM(amount) > 60"
).fetchall()
print(rows)  # [('North', 150.0)]
```

## Common mistakes

- **Formatting SQL strings with f-strings**: `f"WHERE name = '{user}'"` risks SQL injection and syntax errors on quotes; always use `?` placeholders [src:python-tutorial].
- **Filtering aggregates in `WHERE`**: `WHERE SUM(amount) > 100` is invalid SQL; use `HAVING SUM(amount) > 100` [src:sqlite-docs].

## Check your understanding

1. When do you use `HAVING` instead of `WHERE`?
2. Why should `sqlite3` queries use `?` parameter placeholders?
3. Complete the exercises on the right and try the **SQL Playground** in the sidebar.

## Sources

- [src:sqlite-docs] SQLite Documentation (SQLite Consortium)
- [src:python-tutorial] The Python Tutorial and Standard Library Reference (Python Software Foundation)
