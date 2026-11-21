---
problemId: P087
solutions:
  - { file: solutions/reference.py, label: "Per-client deque evicting expired timestamps in amortized O(1)", time: "O(1) amortized", space: "O(clients * limit)" }
---
## Approach
Explanation: Using one `collections.deque` per `client_id` keeps accepted timestamps strictly ordered so expired requests exit from the left via `popleft()` in `O(1)` each [src:python-tutorial]. Checking `len(q) >= self._limit` *before* appending prevents denied bursts from extending the block past legitimate expiry [src:python-wiki-timecomplexity].

## Common mistakes
- Recording rejected timestamps inside the deque, causing repeated retries to stay locked out indefinitely.
- Using `q[0] < cutoff` instead of `q[0] <= cutoff`, miscounting exact boundary expiration at `t = window_seconds`.

## Takeaways
- Only append accepted events to sliding-window rate limiters.

## Related
P072, P039, lesson B8
