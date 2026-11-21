def decimal_to_binary(n: int) -> str:
    if n < 0:
        raise ValueError("Expected non-negative integer")
    if n == 0:
        return "0"
    bits: list[str] = []
    while n > 0:
        n, rem = divmod(n, 2)
        bits.append(str(rem))
    return "".join(reversed(bits))
