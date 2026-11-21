def find_duplicates(nums: list[int]) -> list[int]:
    return sorted({x for x in nums if nums.count(x) > 1})
