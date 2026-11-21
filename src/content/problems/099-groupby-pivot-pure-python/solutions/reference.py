from collections import defaultdict


def pivot_table(
    rows: list[dict],
    index_col: str,
    pivot_col: str,
    value_col: str,
    agg: str = "sum",
    fill_value: float = 0.0,
) -> dict[str, dict[str, float]]:
    if agg not in ("sum", "mean", "count", "min", "max"):
        raise ValueError(f"Unsupported aggregation: {agg}")
    if not rows:
        return {}

    buckets: dict[tuple[str, str], list[float]] = defaultdict(list)
    row_keys_set: set[str] = set()
    col_keys_set: set[str] = set()

    for r in rows:
        rk = str(r[index_col])
        ck = str(r[pivot_col])
        row_keys_set.add(rk)
        col_keys_set.add(ck)
        buckets[(rk, ck)].append(float(r[value_col]))

    row_keys = sorted(row_keys_set)
    col_keys = sorted(col_keys_set)

    def reduce_vals(vals: list[float]) -> float:
        if not vals:
            return round(float(fill_value), 4)
        if agg == "sum":
            ans = sum(vals)
        elif agg == "mean":
            ans = sum(vals) / len(vals)
        elif agg == "count":
            ans = float(len(vals))
        elif agg == "min":
            ans = min(vals)
        else:
            ans = max(vals)
        return round(float(ans), 4)

    return {rk: {ck: reduce_vals(buckets.get((rk, ck), [])) for ck in col_keys} for rk in row_keys}
