from collections import defaultdict


def group_anagrams(words: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for word in words:
        sig = "".join(sorted(set(word)))
        groups[sig].append(word)
    return list(groups.values())
