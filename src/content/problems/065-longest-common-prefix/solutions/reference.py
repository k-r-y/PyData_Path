def longest_common_prefix(words: list[str]) -> str:
    if not words:
        return ""
    first = min(words)
    last = max(words)
    i = 0
    limit = min(len(first), len(last))
    while i < limit and first[i] == last[i]:
        i += 1
    return first[:i]
