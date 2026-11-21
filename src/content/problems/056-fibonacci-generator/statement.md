Use lazy Python generators to stream arbitrary-precision Fibonacci numbers without allocating unbounded lists in memory.

Implement two functions:
1. `fibonacci_gen()`: a generator yielding infinite Fibonacci numbers starting `0, 1, 1, 2, 3, 5, 8, 13, ...` (0-indexed: `F(0)=0, F(1)=1`).
2. `first_fib_with_digits(digits: int) -> int`: returns the **0-based index** of the first Fibonacci number in `fibonacci_gen()` that has at least `digits` decimal digits (for `digits <= 1`, returns `0` because `F(0) = 0` has 1 digit).
