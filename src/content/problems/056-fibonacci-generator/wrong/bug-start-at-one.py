def fibonacci_gen():
    a, b = 1, 1
    while True:
        yield a
        a, b = b, a + b


def first_fib_with_digits(digits: int) -> int:
    for idx, val in enumerate(fibonacci_gen()):
        if len(str(val)) >= digits:
            return idx
    return 0
