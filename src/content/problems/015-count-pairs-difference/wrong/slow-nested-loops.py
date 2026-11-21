def count_diff_pairs(nums: list[int], k: int) -> int:
    if k < 0:
        return 0
    cnt = 0
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if abs(nums[i] - nums[j]) == k:
                cnt += 1
    return cnt
