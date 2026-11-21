def chunks(seq, size: int):
    if size <= 0:
        raise ValueError()
    for i in range(0, len(seq), size):
        yield list(seq[i : i + size])


def sliding_window(seq, k: int):
    if k <= 0:
        raise ValueError()
    for i in range(len(seq) - k + 1):
        yield tuple(seq[i : i + k])
