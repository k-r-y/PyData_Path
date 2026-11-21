def evaluate_expr(expr: str) -> int:
    tokens: list[str] = []
    i = 0
    n = len(expr)
    while i < n:
        ch = expr[i]
        if ch.isspace():
            i += 1
        elif ch in "+-*/()":
            tokens.append(ch)
            i += 1
        elif ch.isdigit():
            start = i
            while i < n and expr[i].isdigit():
                i += 1
            tokens.append(expr[start:i])
        else:
            raise ValueError(f"Unexpected character: {ch!r}")

    pos = 0

    def parse_expr() -> int:
        val = parse_term()
        while pos < len(tokens) and tokens[pos] in ("+", "-"):
            op = tokens[pos]
            _advance()
            rhs = parse_term()
            val = val + rhs if op == "+" else val - rhs
        return val

    def parse_term() -> int:
        val = parse_factor()
        while pos < len(tokens) and tokens[pos] in ("*", "/"):
            op = tokens[pos]
            _advance()
            rhs = parse_factor()
            val = val * rhs if op == "*" else int(val / rhs)
        return val

    def parse_factor() -> int:
        nonlocal pos
        tok = tokens[pos]
        if tok == "-":
            pos += 1
            return -parse_factor()
        if tok == "+":
            pos += 1
            return parse_factor()
        if tok == "(":
            pos += 1
            inner = parse_expr()
            pos += 1
            return inner
        pos += 1
        return int(tok)

    def _advance() -> None:
        nonlocal pos
        pos += 1

    return parse_expr()
