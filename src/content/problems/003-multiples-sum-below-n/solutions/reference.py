def sum_multiples_below(n: int) -> int:
    if n <= 1:
        return 0
    limit = n - 1

    def sum_divisible(step: int) -> int:
        count = limit // step
        return step * count * (count + 1) // 2

    return sum_divisible(3) + sum_divisible(5) - sum_divisible(15)
