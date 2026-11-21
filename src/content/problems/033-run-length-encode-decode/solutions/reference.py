def rle_encode(text: str) -> str:
    if not text:
        return ""
    out: list[str] = []
    cur = text[0]
    count = 1
    for ch in text[1:]:
        if ch == cur:
            count += 1
        else:
            out.append(f"{cur}{count}")
            cur = ch
            count = 1
    out.append(f"{cur}{count}")
    return "".join(out)


def rle_decode(encoded: str) -> str:
    out: list[str] = []
    i = 0
    n = len(encoded)
    while i < n:
        ch = encoded[i]
        i += 1
        start = i
        while i < n and encoded[i].isdigit():
            i += 1
        count = int(encoded[start:i])
        out.append(ch * count)
    return "".join(out)
