def search_range(nums: list[int], target: int) -> tuple[int, int]:
    if target not in nums:
        return (-1, -1)
    first = nums.index(target)
    return (first, first)
