def decimal_to_binary(n: int) -> str:
    bits = []
    while n > 0:
        bits.append(str(n % 2))
        n //= 2
    return "".join(bits)
