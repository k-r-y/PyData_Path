def rotate_right(items: list, k: int) -> list:
    n = len(items)
    if n == 0:
        return []
    r = k % n
    if r == 0:
        return list(items)
    return items[-r:] + items[:-r]
