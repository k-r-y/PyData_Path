def rotate_right(items: list, k: int) -> list:
    if not items or k == 0:
        return list(items)
    return items[-k:] + items[:-k]
