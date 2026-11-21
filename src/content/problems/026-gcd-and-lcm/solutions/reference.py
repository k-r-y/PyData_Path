def gcd_and_lcm(a: int, b: int) -> tuple[int, int]:
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    if x == 0:
        return (0, 0)
    lcm = (abs(a) // x) * abs(b)
    return (x, lcm)
