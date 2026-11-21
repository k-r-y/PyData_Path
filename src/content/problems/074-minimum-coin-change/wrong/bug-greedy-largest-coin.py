def min_coins(coins: list[int], amount: int) -> int:
    cnt = 0
    rem = amount
    for c in sorted(coins, reverse=True):
        use, rem = divmod(rem, c)
        cnt += use
    return cnt if rem == 0 else -1
