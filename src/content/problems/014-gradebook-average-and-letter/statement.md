Compute summary averages and letter grades for an IS course roster.

Write `summarize_gradebook(gradebook: dict[str, list[float]]) -> dict[str, tuple[float, str]]` returning each student mapped to `(rounded_average, letter)`:
- `rounded_average = round(sum(scores) / len(scores), 2)` if `scores` is non-empty, else `0.0`.
- Letter thresholds on `rounded_average`: `>= 90 -> "A"`, `>= 80 -> "B"`, `>= 70 -> "C"`, `>= 60 -> "D"`, otherwise `"F"`.
