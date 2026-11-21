def max_subarray_sum(nums: list[int]) -> int:
    cur = 0
    best = 0
    for x in nums:
        cur = max(0, cur + x)
        best = max(best, cur)
    return best
