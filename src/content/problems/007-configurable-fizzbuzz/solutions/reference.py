def generate_alerts(n: int, rules: list[tuple[int, str]]) -> list[str]:
    if n <= 0:
        return []
    out: list[str] = []
    for i in range(1, n + 1):
        matched = "".join(label for div, label in rules if div != 0 and i % div == 0)
        out.append(matched if matched else str(i))
    return out
