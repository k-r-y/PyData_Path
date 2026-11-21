def all_subsets(nums: list[int]) -> list[list[int]]:
    arr = sorted(nums)
    out: list[list[int]] = []
    path: list[int] = []

    def dfs(start: int) -> None:
        out.append(list(path))
        for i in range(start, len(arr)):
            path.append(arr[i])
            dfs(i + 1)
            path.pop()

    dfs(0)
    return out


def all_permutations(nums: list[int]) -> list[list[int]]:
    arr = sorted(nums)
    n = len(arr)
    used = [False] * n
    out: list[list[int]] = []
    path: list[int] = []

    def dfs() -> None:
        if len(path) == n:
            out.append(list(path))
            return
        for i in range(n):
            if used[i]:
                continue
            used[i] = True
            path.append(arr[i])
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return out
