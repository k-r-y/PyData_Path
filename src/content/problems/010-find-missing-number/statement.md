An ingestion pipeline assigns batch IDs `0, 1, 2, ..., n` consecutively. Exactly one batch failed to arrive, leaving a list `nums` of `n` unique IDs in any order.

Write `find_missing_id(nums: list[int]) -> int` to return the single missing integer in `O(n)` time without modifying `nums`.
