def gcd_and_lcm(a: int, b: int) -> tuple[int, int]:
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    return (x, abs(a * b) // x)
