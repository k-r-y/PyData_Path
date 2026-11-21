from collections import Counter


def are_anagrams(a: str, b: str) -> bool:
    return Counter(ch.lower() for ch in a if ch != ' ') == Counter(ch.lower() for ch in b if ch != ' ')
