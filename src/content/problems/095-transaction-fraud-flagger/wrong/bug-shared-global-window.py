from collections import deque


def flag_fraud(events: list[dict]) -> list[dict]:
    q: deque[int] = deque()
    flagged = []
    for ev in events:
        reasons = []
        if ev["amount"] > 5000:
            reasons.append("HIGH_AMOUNT")
        while q and q[0] < ev["ts"] - 60:
            q.popleft()
        q.append(ev["ts"])
        if len(q) > 3:
            reasons.append("VELOCITY")
        if reasons:
            flagged.append({"tx_id": ev["tx_id"], "reasons": sorted(reasons)})
    return flagged
