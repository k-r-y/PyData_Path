def find_duplicates(nums: list[int]) -> list[int]:
    seen = set()
    dupes = set()
    for x in nums:
        if x in seen:
            dupes.add(x)
        else:
            seen.add(x)
    return sorted(dupes)
