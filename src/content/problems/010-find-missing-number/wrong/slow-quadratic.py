def find_missing_id(nums: list[int]) -> int:
    n = len(nums)
    for x in range(n + 1):
        if x not in nums:
            return x
    return -1
