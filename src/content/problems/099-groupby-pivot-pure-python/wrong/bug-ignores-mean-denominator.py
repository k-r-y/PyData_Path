from collections import defaultdict


def pivot_table(rows, index_col, pivot_col, value_col, agg="sum", fill_value=0.0):
    if not rows:
        return {}
    buckets = defaultdict(list)
    rks = sorted({str(r[index_col]) for r in rows})
    cks = sorted({str(r[pivot_col]) for r in rows})
    for r in rows:
        buckets[(str(r[index_col]), str(r[pivot_col]))].append(float(r[value_col]))
    return {
        rk: {
            ck: round(sum(buckets[(rk, ck)]) / len(rows), 4) if buckets[(rk, ck)] else float(fill_value)
            for ck in cks
        }
        for rk in rks
    }
