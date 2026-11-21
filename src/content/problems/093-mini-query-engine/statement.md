Implement `query_records(rows: list[dict], spec: dict) -> list[dict]` to execute SQL-like queries cleanly over in-memory record dictionaries without mutating `rows`.

### Query Specification (`spec` optional keys)
- `"where"`: list of `[field, op, value]` predicates combined with logical `AND`. Supported `op`: `"=="`, `"!="`, `">"`, `">="`, `"<"`, `"<="`, `"in"`.
- `"order_by"`: list of `[field, descending_bool]` applied sequentially (first key most significant). Preserves relative order on complete ties.
- `"limit"`: non-negative `int` capping rows returned after sorting.
- `"select"`: list of field names to project into each output dict (if omitted, return full copied dicts).
