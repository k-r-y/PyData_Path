from collections import Counter


def first_unique_char(text: str) -> int:
    counts = Counter(text)
    for i, ch in enumerate(text):
        if counts[ch] == 1:
            return i
    return -1
