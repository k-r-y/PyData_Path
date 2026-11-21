Implement two lazy iterator utilities working cleanly over ANY iterable (lists, strings, or single-pass generator expressions):
- `chunks(iterable, size: int)`: yields non-overlapping `list` batches of length up to `size` (final batch may be shorter). Raises `ValueError` if `size <= 0`.
- `sliding_window(iterable, k: int)`: yields overlapping `tuple` windows of exact length `k` (yields nothing if fewer than `k` items exist). Raises `ValueError` if `k <= 0`.
