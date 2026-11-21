def query_records(rows: list[dict], spec: dict) -> list[dict]:
    res = list(rows)
    for field, desc in spec.get("order_by") or []:
        res.sort(key=lambda r: r[field], reverse=bool(desc))
    if spec.get("limit") is not None:
        res = res[: spec["limit"]]
    cols = spec.get("select")
    return [{c: r[c] for c in cols} for r in res] if cols is not None else [dict(r) for r in res]
