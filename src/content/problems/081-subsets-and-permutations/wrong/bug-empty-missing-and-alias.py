def all_subsets(nums: list[int]) -> list[list[int]]:
    out = []
    path = []
    def dfs(i):
        if i == len(nums):
            out.append(path)
            return
        dfs(i + 1)
        path.append(nums[i])
        dfs(i + 1)
        path.pop()
    dfs(0)
    return sorted(out)


def all_permutations(nums: list[int]) -> list[list[int]]:
    return []
