def second_largest_unique(nums):
    first = second = 0
    for x in nums:
        if x > first:
            second = first
            first = x
        elif x != first and x > second:
            second = x
    return None if len(set(nums)) < 2 else second
