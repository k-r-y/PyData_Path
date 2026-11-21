def max_subarray_sum(nums: list[int]) -> int:
    if not nums:
        return 0
    n = len(nums)
    best = nums[0]
    for i in range(n):
        s = 0
        for j in range(i, n):
            s += nums[j]
            if s > best:
                best = s
    return best
