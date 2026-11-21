Without calling `itertools.combinations` or `itertools.permutations`, write two backtracking generators/functions for a list of distinct integers `nums`:
- `all_subsets(nums: list[int]) -> list[list[int]]`: returns all `2^n` subsets where each subset is ascending and the outer list is sorted lexicographically.
- `all_permutations(nums: list[int]) -> list[list[int]]`: returns all `n!` permutations sorted lexicographically.

Do not mutate `nums`.
