import time


class Timer:
    """Context manager measuring elapsed seconds via time.perf_counter()."""
    def __init__(self, label: str = ""):
        self.label = label
        self.elapsed = 0.0

    def __enter__(self):
        # TODO
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # TODO
        return False
