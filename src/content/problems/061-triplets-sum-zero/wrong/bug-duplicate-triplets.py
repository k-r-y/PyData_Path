def three_sum(nums: list[int]) -> list[list[int]]:
    arr = sorted(nums)
    n = len(arr)
    out = []
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = arr[i] + arr[lo] + arr[hi]
            if s == 0:
                out.append([arr[i], arr[lo], arr[hi]])
                lo += 1
                hi -= 1
            elif s < 0:
                lo += 1
            else:
                hi -= 1
    return out
