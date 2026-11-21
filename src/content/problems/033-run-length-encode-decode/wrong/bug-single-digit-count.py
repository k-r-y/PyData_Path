def rle_encode(text: str) -> str:
    if not text:
        return ""
    out = []
    cur, count = text[0], 1
    for ch in text[1:]:
        if ch == cur:
            count += 1
        else:
            out.append(f"{cur}{count}")
            cur, count = ch, 1
    out.append(f"{cur}{count}")
    return "".join(out)


def rle_decode(encoded: str) -> str:
    return "".join(encoded[i] * int(encoded[i + 1]) for i in range(0, len(encoded), 2))
