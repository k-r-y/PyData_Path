def caesar_shift(text: str, shift: int) -> str:
    k = shift % 26
    out = []
    for ch in text:
        if 'a' <= ch <= 'z':
            base = ord('a')
            out.append(chr(base + (ord(ch) - base + k) % 26))
        elif 'A' <= ch <= 'Z':
            base = ord('A')
            out.append(chr(base + (ord(ch) - base + k) % 26))
        else:
            out.append(ch)
    return ''.join(out)
