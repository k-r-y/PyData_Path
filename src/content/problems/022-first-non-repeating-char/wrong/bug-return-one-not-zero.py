from collections import Counter


def first_unique_char(text: str) -> int:
    c = Counter(text)
    for i, ch in enumerate(text):
        if c[ch] == 1:
            return i if i > 0 else -1
    return -1
