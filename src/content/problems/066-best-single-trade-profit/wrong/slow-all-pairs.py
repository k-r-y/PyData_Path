def max_single_profit(prices):
    best = 0
    n = len(prices)
    for i in range(n):
        for j in range(i + 1, n):
            if prices[j] - prices[i] > best:
                best = prices[j] - prices[i]
    return best
