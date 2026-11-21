def analyze_words(text: str):
    vowels = set("aeiouAEIOU")
    out = []
    for token in text.split():
        v = sum(1 for ch in token if ch in vowels)
        c = sum(1 for ch in token if ch not in vowels)
        out.append((token, v, c))
    return out
