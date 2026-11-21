def binary_to_decimal(bits: str) -> int:
    if not bits:
        raise ValueError("Empty bitstring")
    total = 0
    for ch in bits:
        if ch == '1':
            total = total * 2 + 1
        elif ch == '0':
            total = total * 2
        else:
            raise ValueError(f"Invalid bit character: {ch!r}")
    return total
