def longest_common_prefix(words: list[str]) -> str:
    if not words:
        return ""
    out = []
    for chars in zip(*words):
        if len(set(chars)) == 1:
            out.append(chars[0])
        else:
            break
    return "".join(out)
