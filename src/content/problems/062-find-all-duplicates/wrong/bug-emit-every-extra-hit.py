def find_duplicates(nums: list[int]) -> list[int]:
    seen = set()
    dupes = []
    for x in nums:
        if x in seen:
            dupes.append(x)
        seen.add(x)
    return sorted(dupes)
