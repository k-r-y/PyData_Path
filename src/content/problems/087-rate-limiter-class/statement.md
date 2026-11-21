Implement a sliding-window per-client API rate limiter `class RateLimiter(max_requests: int, window_seconds: float)` assuming timestamps are non-decreasing.

Method `allow(client_id: str, timestamp: float) -> bool`:
- Evicts any recorded request timestamp `t <= timestamp - window_seconds` (active window is `(timestamp - window_seconds, timestamp]`).
- If fewer than `max_requests` active requests remain for `client_id`, records `timestamp` and returns `True`; otherwise does NOT record the rejected attempt and returns `False`.
