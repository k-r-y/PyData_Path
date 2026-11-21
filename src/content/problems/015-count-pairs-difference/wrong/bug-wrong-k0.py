from collections import Counter


def count_diff_pairs(nums: list[int], k: int) -> int:
    if k < 0:
        return 0
    freq = Counter(nums)
    return sum(count * freq.get(x + k, 0) for x, count in freq.items())
