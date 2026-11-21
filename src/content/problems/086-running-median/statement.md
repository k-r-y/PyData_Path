Maintain the exact running median of an online stream of numbers in `O(log n)` per insert and `O(1)` per query.

Implement `class MedianTracker`:
- `add(num: int | float) -> None`
- `median() -> float`: returns exact `float` median (average of middle pair on even counts; raises `ValueError` if empty).
