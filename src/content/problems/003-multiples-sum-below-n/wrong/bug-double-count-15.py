def sum_multiples_below(n: int) -> int:
    if n <= 1:
        return 0
    limit = n - 1
    def s(step: int) -> int:
        c = limit // step
        return step * c * (c + 1) // 2
    return s(3) + s(5)
