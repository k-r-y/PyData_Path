def primes_up_to(n: int) -> list[int]:
    if n < 2:
        return []
    out = []
    for x in range(2, n + 1):
        if all(x % d != 0 for d in range(2, x)):
            out.append(x)
    return out
