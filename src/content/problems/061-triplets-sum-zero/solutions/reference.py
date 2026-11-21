def three_sum(nums: list[int]) -> list[list[int]]:
    arr = sorted(nums)
    n = len(arr)
    out: list[list[int]] = []
    for i in range(n - 2):
        if arr[i] > 0:
            break
        if i > 0 and arr[i] == arr[i - 1]:
            continue
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = arr[i] + arr[lo] + arr[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([arr[i], arr[lo], arr[hi]])
                lo += 1
                hi -= 1
                while lo < hi and arr[lo] == arr[lo - 1]:
                    lo += 1
                while lo < hi and arr[hi] == arr[hi + 1]:
                    hi -= 1
    return out
