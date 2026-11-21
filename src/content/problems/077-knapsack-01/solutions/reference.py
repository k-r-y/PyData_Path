def knapsack_max_value(weights: list[int], values: list[int], capacity: int) -> int:
    if capacity <= 0 or not weights:
        return 0
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        if w > capacity:
            continue
        for cap in range(capacity, w - 1, -1):
            cand = dp[cap - w] + v
            if cand > dp[cap]:
                dp[cap] = cand
    return dp[capacity]
