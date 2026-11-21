from collections import defaultdict


def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for word in words:
        sig = "".join(sorted(word))
        groups[sig].append(word)
    return list(groups.values())
