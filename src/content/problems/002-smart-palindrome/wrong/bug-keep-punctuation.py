def is_smart_palindrome(text: str) -> bool:
    s = text.lower().replace(" ", "")
    return s == s[::-1]
