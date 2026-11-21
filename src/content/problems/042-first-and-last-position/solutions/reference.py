def search_range(nums: list[int], target: int) -> tuple[int, int]:
    def find_bound(find_first: bool) -> int:
        lo, hi = 0, len(nums) - 1
        ans = -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                ans = mid
                if find_first:
                    hi = mid - 1
                else:
                    lo = mid + 1
            elif nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return ans

    first = find_bound(True)
    if first == -1:
        return (-1, -1)
    return (first, find_bound(False))
