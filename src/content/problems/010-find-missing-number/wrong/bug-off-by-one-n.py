def find_missing_id(nums: list[int]) -> int:
    n = len(nums)
    return (n - 1) * n // 2 - sum(nums)
