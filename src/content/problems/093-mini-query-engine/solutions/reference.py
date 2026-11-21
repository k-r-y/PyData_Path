def query_records(rows: list[dict], spec: dict) -> list[dict]:
    ops = {
        "==": lambda a, b: a == b,
        "!=": lambda a, b: a != b,
        ">": lambda a, b: a > b,
        ">=": lambda a, b: a >= b,
        "<": lambda a, b: a < b,
        "<=": lambda a, b: a <= b,
        "in": lambda a, b: a in b,
    }
    where = spec.get("where") or []
    filtered = [
        r for r in rows
        if all(field in r and ops[op](r[field], target) for field, op, target in where)
    ]

    for field, desc in reversed(spec.get("order_by") or []):
        filtered.sort(key=lambda r, f=field: r[f], reverse=bool(desc))

    limit = spec.get("limit")
    if limit is not None:
        filtered = filtered[: max(0, limit)]

    cols = spec.get("select")
    if cols is None:
        return [dict(r) for r in filtered]
    return [{c: r[c] for c in cols if c in r} for r in filtered]
