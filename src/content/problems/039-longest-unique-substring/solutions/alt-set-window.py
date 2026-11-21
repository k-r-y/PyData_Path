def longest_unique_window(events: str) -> int:
    window: set[str] = set()
    left = 0
    best = 0
    for right, ch in enumerate(events):
        while ch in window:
            window.remove(events[left])
            left += 1
        window.add(ch)
        cur = right - left + 1
        if cur > best:
            best = cur
    return best
