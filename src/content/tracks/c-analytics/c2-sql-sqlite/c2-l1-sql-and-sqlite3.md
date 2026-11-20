---
id: "c2-l1-sql-and-sqlite3"
moduleId: "c2-sql-sqlite"
title: "SQL Queries and sqlite3 in Python"
order: 1
estimatedMinutes: 25
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

### 1. Filtering and Sorting (`SELECT`, `WHERE`, `ORDER BY`)

SQL retrieves rows from relational tables [src:sqlite-docs]. `WHERE` filters individual rows before any grouping, and `ORDER BY col DESC` sorts the final output [src:sqlite-docs].

```sql
SELECT student, score
FROM enrollments
WHERE dept = 'IS' AND score >= 85
ORDER BY score DESC;
```

Explanation: Think of `WHERE` as a row-by-row gatekeeper: only rows that satisfy the condition pass through to the next step.

### 2. Grouping and Filtering Groups (`GROUP BY`, `HAVING`)

`GROUP BY` collapses rows sharing the same key into summary rows using `COUNT()`, `SUM()`, `AVG()`, `MIN()`, or `MAX()` [src:sqlite-docs]. `HAVING` filters those **grouped** summaries afterward [src:sqlite-docs].

```sql
SELECT dept, COUNT(*) AS n, ROUND(AVG(score), 1) AS avg_score
FROM enrollments
GROUP BY dept
HAVING AVG(score) >= 80;
```

Explanation: Remember `WHERE` vs `HAVING` by timing: `WHERE` filters raw rows *before* grouping; `HAVING` filters the *buckets themselves* after `GROUP BY`.

### 3. Combining Tables (`INNER JOIN`, `LEFT JOIN`) and Subqueries

- `INNER JOIN`: Returns only rows where the join key matches in both tables [src:sqlite-docs].
- `LEFT JOIN`: Keeps **all** rows from the left table, filling unmatched right-table columns with `NULL` [src:sqlite-docs].
- **Subquery**: A nested `SELECT` inside `WHERE` or `FROM` for multi-step filtering [src:sqlite-docs].

```sql
SELECT c.code, e.student
FROM courses c
LEFT JOIN enrollments e ON c.code = e.course_code;
```

Explanation: Use `LEFT JOIN` when you want to spot courses with *zero* enrollments (they would disappear under `INNER JOIN`).

### 4. Calling SQLite From Python (`sqlite3`)

Python's built-in `sqlite3` module runs SQLite databases in memory (`sqlite3.connect(":memory:")`) or from `.db` files [src:python-tutorial]. Always pass user values via `?` placeholders (`cur.execute("SELECT * FROM t WHERE id = ?", (val,))`) to prevent SQL injection [src:python-tutorial].

```python
import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE items (sku TEXT, stock INT)")
cur.execute("INSERT INTO items VALUES (?, ?)", ("A1", 12))
print(cur.execute("SELECT * FROM items WHERE sku = ?", ("A1",)).fetchall())
```

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
