def second_largest_unique(nums):
    unique = sorted(set(nums), reverse=True)
    return unique[1] if len(unique) >= 2 else None
