def are_anagrams(a: str, b: str) -> bool:
    clean_a = sorted(a.replace(' ', '').lower())
    clean_b = sorted(b.replace(' ', '').lower())
    return clean_a == clean_b
