def three_sum(nums: list[int]) -> list[list[int]]:
    n = len(nums)
    seen = set()
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    seen.add(tuple(sorted((nums[i], nums[j], nums[k]))))
    return sorted(list(t) for t in seen)
