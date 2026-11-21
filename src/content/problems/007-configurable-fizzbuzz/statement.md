An alert scheduler checks integers from `1` through `n` against a list of `(divisor, label)` rules.

Write `generate_alerts(n: int, rules: list[tuple[int, str]]) -> list[str]` returning a list of strings of length `n` (for `1..n`) where entry `i` is:
- The concatenation of `label` for every rule `(divisor, label)` in `rules` (in given order) such that `i % divisor == 0`, or
- `str(i)` if no rules match.

If `n <= 0`, return `[]`.
