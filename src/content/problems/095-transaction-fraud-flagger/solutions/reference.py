from collections import defaultdict, deque


def flag_fraud(events: list[dict]) -> list[dict]:
    windows: dict[str, deque[int]] = defaultdict(deque)
    last_seen: dict[str, tuple[int, str]] = {}
    flagged: list[dict] = []

    for ev in events:
        acct = ev["account"]
        ts = ev["ts"]
        reasons: list[str] = []

        if ev["amount"] > 5000.0:
            reasons.append("HIGH_AMOUNT")

        q = windows[acct]
        cutoff = ts - 60
        while q and q[0] < cutoff:
            q.popleft()
        q.append(ts)
        if len(q) > 3:
            reasons.append("VELOCITY")

        if acct in last_seen:
            prev_ts, prev_country = last_seen[acct]
            if ev["country"] != prev_country and (ts - prev_ts) <= 300:
                reasons.append("GEO_IMPOSSIBLE")
        last_seen[acct] = (ts, ev["country"])

        if reasons:
            flagged.append({"tx_id": ev["tx_id"], "reasons": sorted(reasons)})

    return flagged
