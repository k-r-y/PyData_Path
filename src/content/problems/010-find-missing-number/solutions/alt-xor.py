def find_missing_id(nums: list[int]) -> int:
    missing = len(nums)
    for i, val in enumerate(nums):
        missing ^= i ^ val
    return missing
