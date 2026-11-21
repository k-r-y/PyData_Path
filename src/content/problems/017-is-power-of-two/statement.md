Hash ring partitioning requires shard counts to be exact powers of two (`1, 2, 4, 8, ...`).

Write `is_power_of_two(n: int) -> bool` returning `True` if `n == 2**k` for some integer `k >= 0`, and `False` otherwise.
