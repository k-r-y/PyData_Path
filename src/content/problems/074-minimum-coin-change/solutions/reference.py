def min_coins(coins: list[int], amount: int) -> int:
    if amount == 0:
        return 0
    if not coins or amount < 0:
        return -1
    inf = amount + 1
    dp = [inf] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        if coin <= 0:
            continue
        for x in range(coin, amount + 1):
            cand = dp[x - coin] + 1
            if cand < dp[x]:
                dp[x] = cand
    return -1 if dp[amount] >= inf else dp[amount]
