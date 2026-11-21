def max_single_profit(prices):
    if not prices:
        return 0
    min_price = prices[0]
    best = 0
    for price in prices[1:]:
        if price < min_price:
            min_price = price
        elif price - min_price > best:
            best = price - min_price
    return best
