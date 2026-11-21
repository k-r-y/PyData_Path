def second_largest_unique(nums):
    first = None
    second = None
    for x in nums:
        if first is None or x > first:
            if x != first:
                second = first
            first = x
        elif x != first and (second is None or x > second):
            second = x
    return second
