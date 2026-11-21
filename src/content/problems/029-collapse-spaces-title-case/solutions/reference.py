def normalize_heading(text: str) -> str:
    return " ".join(word.capitalize() for word in text.split())
