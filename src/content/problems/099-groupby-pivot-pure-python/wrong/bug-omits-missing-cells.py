from collections import defaultdict


def pivot_table(rows, index_col, pivot_col, value_col, agg="sum", fill_value=0.0):
    if not rows:
        return {}
    buckets = defaultdict(lambda: defaultdict(list))
    for r in rows:
        buckets[str(r[index_col])][str(r[pivot_col])].append(float(r[value_col]))
    out = {}
    for rk, cols in sorted(buckets.items()):
        out[rk] = {ck: round(sum(vs), 4) for ck, vs in sorted(cols.items())}
    return out
