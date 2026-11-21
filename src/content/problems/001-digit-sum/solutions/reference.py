def digit_sum(n: int) -> int:
    total = 0
    while n > 0:
        n, rem = divmod(n, 10)
        total += rem
    return total
