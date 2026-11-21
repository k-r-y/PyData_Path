def longest_word(text: str) -> str:
    best = ""
    for word in text.split():
        if len(word) >= len(best):
            best = word
    return best
