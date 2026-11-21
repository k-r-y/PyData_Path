from collections import deque
from itertools import islice


def chunks(iterable, size: int):
    if size <= 0:
        raise ValueError("size must be positive")
    it = iter(iterable)
    while True:
        batch = list(islice(it, size))
        if not batch:
            break
        yield batch


def sliding_window(iterable, k: int):
    if k <= 0:
        raise ValueError("k must be positive")
    it = iter(iterable)
    window = deque(islice(it, k), maxlen=k)
    if len(window) == k:
        yield tuple(window)
    for item in it:
        window.append(item)
        yield tuple(window)
