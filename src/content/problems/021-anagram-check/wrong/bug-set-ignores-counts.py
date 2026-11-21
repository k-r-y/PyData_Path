def are_anagrams(a: str, b: str) -> bool:
    return set(a.replace(' ', '').lower()) == set(b.replace(' ', '').lower())
