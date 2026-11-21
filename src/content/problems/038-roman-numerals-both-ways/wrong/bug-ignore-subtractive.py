def int_to_roman(n: int) -> str:
    tbl = [(1000,"M"),(500,"D"),(100,"C"),(50,"L"),(10,"X"),(5,"V"),(1,"I")]
    out = []
    for v, s in tbl:
        c, n = divmod(n, v)
        out.append(s * c)
    return "".join(out)


def roman_to_int(s: str) -> int:
    vals = {"I":1,"V":5,"X":10,"L":50,"C":100,"D":500,"M":1000}
    return sum(vals[c] for c in s)
