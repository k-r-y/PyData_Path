def caesar_shift(text: str, shift: int) -> str:
    return ''.join(chr(ord(c) + (shift % 26)) if c.isalnum() else c for c in text)
