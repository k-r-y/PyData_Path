def binary_to_decimal(bits: str) -> int:
    total = 0
    for idx, ch in enumerate(bits):
        if ch == '1':
            total += 2 ** idx
    return total
