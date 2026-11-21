A billing cron runs audit jobs on ledger day numbers divisible by `3` or `5`. Before a cutoff day `n`, you want the total sum of all scheduled day numbers strictly less than `n`.

Write `sum_multiples_below(n: int) -> int` returning the sum of all positive integers `x < n` such that `x` is divisible by `3` or `5`.

### Notes
- If `n <= 0`, return `0`.
- Numbers divisible by both `3` and `5` (multiples of `15`) must only be counted once.
- Large inputs (up to `25,000,000`) require constant-time `O(1)` arithmetic rather than iterating through every integer.
