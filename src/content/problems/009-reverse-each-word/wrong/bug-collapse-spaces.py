def reverse_each_word(text: str) -> str:
    return " ".join(word[::-1] for word in text.split())
