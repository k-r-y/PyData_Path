def second_largest_unique(nums):
    if len(nums) < 2:
        return None
    s = sorted(nums, reverse=True)
    return s[1]
