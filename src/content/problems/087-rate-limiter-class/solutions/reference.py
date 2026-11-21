from collections import defaultdict, deque


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: float):
        self._limit = max_requests
        self._window = window_seconds
        self._clients: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, client_id: str, timestamp: float) -> bool:
        q = self._clients[client_id]
        cutoff = timestamp - self._window
        while q and q[0] <= cutoff:
            q.popleft()
        if len(q) >= self._limit:
            return False
        q.append(timestamp)
        return True
