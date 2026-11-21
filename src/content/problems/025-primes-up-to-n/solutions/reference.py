def primes_up_to(n: int) -> list[int]:
    if n < 2:
        return []
    sieve = bytearray([1]) * (n + 1)
    sieve[0] = 0
    sieve[1] = 0
    limit = int(n ** 0.5)
    for p in range(2, limit + 1):
        if sieve[p]:
            start = p * p
            count = (n - start) // p + 1
            sieve[start : n + 1 : p] = bytearray(count)
    return [i for i in range(2, n + 1) if sieve[i]]
