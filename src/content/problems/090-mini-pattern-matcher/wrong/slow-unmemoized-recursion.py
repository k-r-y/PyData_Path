def is_match(text: str, pattern: str) -> bool:
    def match(i: int, j: int) -> bool:
        if j == len(pattern):
            return i == len(text)
        first = i < len(text) and pattern[j] in (text[i], ".")
        if j + 1 < len(pattern) and pattern[j + 1] == "*":
            return match(i, j + 2) or (first and match(i + 1, j))
        return first and match(i + 1, j + 1)

    return match(0, 0)
