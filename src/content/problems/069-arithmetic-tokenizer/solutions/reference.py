def tokenize_expr(expr: str) -> list[str]:
    tokens: list[str] = []
    i = 0
    n = len(expr)
    ops = {'+', '-', '*', '/', '(', ')'}

    while i < n:
        ch = expr[i]
        if ch.isspace():
            i += 1
        elif ch in ops:
            tokens.append(ch)
            i += 1
        elif ch.isdigit() or ch == '.':
            start = i
            dots = 0
            while i < n and (expr[i].isdigit() or expr[i] == '.'):
                if expr[i] == '.':
                    dots += 1
                    if dots > 1:
                        raise ValueError("Multiple decimal points in number")
                i += 1
            tok = expr[start:i]
            if tok == '.':
                raise ValueError("Isolated dot is not a valid number")
            tokens.append(tok)
        else:
            raise ValueError(f"Unexpected character {ch!r}")
    return tokens
