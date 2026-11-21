from collections import Counter


def count_diff_pairs(nums: list[int], k: int) -> int:
    if k < 0 or len(nums) < 2:
        return 0
    freq = Counter(nums)
    if k == 0:
        return sum(c * (c - 1) // 2 for c in freq.values())
    return sum(count * freq.get(x + k, 0) for x, count in freq.items())
