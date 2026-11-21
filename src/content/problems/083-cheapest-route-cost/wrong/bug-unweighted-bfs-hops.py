from collections import deque


def cheapest_route(n: int, edges: list[list[int]], start: int, end: int) -> int:
    if start == end:
        return 0
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    q = deque([(start, 0)])
    seen = {start}
    while q:
        u, cost = q.popleft()
        if u == end:
            return cost
        for v, w in adj[u]:
            if v not in seen:
                seen.add(v)
                q.append((v, cost + w))
    return -1
