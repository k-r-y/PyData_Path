def first_unique_char(text: str) -> int:
    for i, ch in enumerate(text):
        if text.count(ch) == 1:
            return i
    return -1
