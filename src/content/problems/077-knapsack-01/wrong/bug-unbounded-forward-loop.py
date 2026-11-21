def knapsack_max_value(weights: list[int], values: list[int], capacity: int) -> int:
    if capacity <= 0 or not weights:
        return 0
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for cap in range(w, capacity + 1):
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[capacity]
