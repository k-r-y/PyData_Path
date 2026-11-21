def query_records(rows: list[dict], spec: dict) -> list[dict]:
    cols = spec.get("select")
    out = []
    for r in rows:
        if cols is not None:
            for k in list(r.keys()):
                if k not in cols:
                    r.pop(k)
        out.append(r)
    return out
