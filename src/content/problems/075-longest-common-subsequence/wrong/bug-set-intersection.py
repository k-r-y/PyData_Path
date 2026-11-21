def lcs_length(a: str, b: str) -> int:
    return len(set(a) & set(b))
