def longest_unique_window(events: str) -> int:
    best = 0
    n = len(events)
    for i in range(n):
        seen: set[str] = set()
        for j in range(i, n):
            if events[j] in seen:
                break
            seen.add(events[j])
            if j - i + 1 > best:
                best = j - i + 1
    return best
