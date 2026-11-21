def product_except_self(nums: list[int]) -> list[int]:
    total = 1
    for x in nums:
        total *= x
    return [total // x for x in nums]
