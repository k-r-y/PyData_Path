def caesar_shift(text: str, shift: int) -> str:
    out = []
    for ch in text:
        if 'a' <= ch <= 'z' or 'A' <= ch <= 'Z':
            out.append(chr(ord(ch) + shift))
        else:
            out.append(ch)
    return ''.join(out)
