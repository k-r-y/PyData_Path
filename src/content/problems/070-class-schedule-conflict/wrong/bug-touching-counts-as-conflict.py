def find_conflicts(sessions) -> list[tuple[str, str]]:
    ordered = sorted(sessions, key=lambda s: (s[1], s[2], s[0]))
    out = []
    for i in range(len(ordered)):
        c1, _s1, e1 = ordered[i]
        for j in range(i + 1, len(ordered)):
            c2, s2, _e2 = ordered[j]
            if s2 > e1:
                break
            out.append((c1, c2) if c1 < c2 else (c2, c1))
    return sorted(out)
