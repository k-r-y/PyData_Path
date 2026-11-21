def fibonacci_gen():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b


def first_fib_with_digits(digits: int) -> int:
    if digits <= 1:
        return 0
    threshold = 10 ** (digits - 1)
    for idx, val in enumerate(fibonacci_gen()):
        if val >= threshold:
            return idx
    return 0
