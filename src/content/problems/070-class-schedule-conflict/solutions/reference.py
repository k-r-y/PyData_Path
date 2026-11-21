def find_conflicts(sessions) -> list[tuple[str, str]]:
    if len(sessions) < 2:
        return []
    ordered = sorted(sessions, key=lambda s: (s[1], s[2], s[0]))
    conflicts: list[tuple[str, str]] = []
    n = len(ordered)
    for i in range(n):
        c1, _s1, e1 = ordered[i]
        for j in range(i + 1, n):
            c2, s2, _e2 = ordered[j]
            if s2 >= e1:
                break
            conflicts.append((c1, c2) if c1 < c2 else (c2, c1))
    conflicts.sort()
    return conflicts
