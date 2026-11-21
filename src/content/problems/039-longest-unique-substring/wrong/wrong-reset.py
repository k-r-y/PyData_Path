def longest_unique_window(events: str) -> int:
    seen: set[str] = set()
    best = 0
    for ch in events:
        if ch in seen:
            seen.clear()
        seen.add(ch)
        if len(seen) > best:
            best = len(seen)
    return best
