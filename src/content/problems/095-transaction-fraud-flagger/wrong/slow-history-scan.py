def flag_fraud(events: list[dict]) -> list[dict]:
    flagged = []
    history = []
    last_seen = {}
    for ev in events:
        acct = ev["account"]
        ts = ev["ts"]
        reasons = []
        if ev["amount"] > 5000:
            reasons.append("HIGH_AMOUNT")
        history.append((acct, ts))
        cnt = sum(1 for a, t in history if a == acct and ts - 60 <= t <= ts)
        if cnt > 3:
            reasons.append("VELOCITY")
        if acct in last_seen and last_seen[acct][1] != ev["country"] and ts - last_seen[acct][0] <= 300:
            reasons.append("GEO_IMPOSSIBLE")
        last_seen[acct] = (ts, ev["country"])
        if reasons:
            flagged.append({"tx_id": ev["tx_id"], "reasons": sorted(reasons)})
    return flagged
