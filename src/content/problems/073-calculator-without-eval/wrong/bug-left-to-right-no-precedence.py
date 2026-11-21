def evaluate_expr(expr: str) -> int:
    toks = expr.replace("(", "").replace(")", "").split()
    acc = int(toks[0])
    for i in range(1, len(toks), 2):
        op, rhs = toks[i], int(toks[i + 1])
        if op == "+": acc += rhs
        elif op == "-": acc -= rhs
        elif op == "*": acc *= rhs
        else: acc = int(acc / rhs)
    return acc
