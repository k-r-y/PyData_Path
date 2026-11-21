def analyze_words(text: str) -> list[tuple[str, int, int]]:
    vowels = set("aeiouAEIOU")
    out = []
    for token in text.split():
        v = 0
        c = 0
        for ch in token:
            if ('a' <= ch <= 'z') or ('A' <= ch <= 'Z'):
                if ch in vowels:
                    v += 1
                else:
                    c += 1
        out.append((token, v, c))
    return out
