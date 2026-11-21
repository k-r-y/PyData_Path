def is_smart_palindrome(text: str) -> bool:
    cleaned = [ch for ch in text if ch.isalnum()]
    return cleaned == cleaned[::-1]
