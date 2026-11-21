def digit_sum(n: int) -> int:
    total = 0
    while n > 1:
        total += n % 10
        n //= 10
    return total
