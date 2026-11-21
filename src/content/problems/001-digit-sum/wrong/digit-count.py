def digit_sum(n: int) -> int:
    if n == 0:
        return 0
    count = 0
    while n > 0:
        count += 1
        n //= 10
    return count
