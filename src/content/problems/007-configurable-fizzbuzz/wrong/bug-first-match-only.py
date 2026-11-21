def generate_alerts(n: int, rules: list[tuple[int, str]]) -> list[str]:
    out = []
    for i in range(1, n + 1):
        val = str(i)
        for div, label in rules:
            if div != 0 and i % div == 0:
                val = label
                break
        out.append(val)
    return out
