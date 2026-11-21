def max_subarray_sum(nums: list[int]) -> int:
    if not nums:
        return 0
    cur = best = nums[0]
    for x in nums[1:]:
        cur = x if x > cur + x else cur + x
        if cur > best:
            best = cur
    return best
