from functools import lru_cache


def is_match(text: str, pattern: str) -> bool:
    n, m = len(text), len(pattern)

    @lru_cache(maxsize=None)
    def match(i: int, j: int) -> bool:
        if j == m:
            return i == n
        first_match = i < n and pattern[j] in (text[i], ".")
        if j + 1 < m and pattern[j + 1] == "*":
            return match(i, j + 2) or (first_match and match(i + 1, j))
        return first_match and match(i + 1, j + 1)

    return match(0, 0)
