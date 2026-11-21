from collections import defaultdict, deque


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: float):
        self.limit = max_requests
        self.window = window_seconds
        self.logs = defaultdict(deque)

    def allow(self, client_id: str, timestamp: float) -> bool:
        q = self.logs[client_id]
        cutoff = timestamp - self.window
        while q and q[0] <= cutoff:
            q.popleft()
        q.append(timestamp)
        return len(q) <= self.limit
