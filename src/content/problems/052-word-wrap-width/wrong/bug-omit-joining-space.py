def wrap_text(text: str, width: int) -> str:
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        if len(cur) + len(w) <= width:
            cur = f"{cur} {w}" if cur else w
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return "\n".join(lines)
