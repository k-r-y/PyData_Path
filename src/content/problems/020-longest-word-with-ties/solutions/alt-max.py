def longest_word(text: str) -> str:
    words = text.split()
    return max(words, key=len) if words else ""
