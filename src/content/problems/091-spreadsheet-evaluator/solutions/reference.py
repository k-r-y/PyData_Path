def evaluate_sheet(cells: dict[str, int | str]) -> dict[str, int]:
    state: dict[str, int] = {}
    memo: dict[str, int] = {}

    def tokenize(expr: str) -> list[str]:
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
            elif ch.isalpha() or ch == "_":
                start = i
                while i < n and (expr[i].isalnum() or expr[i] == "_"):
                    i += 1
                tokens.append(expr[start:i])
            else:
                raise ValueError(f"Unexpected token {ch!r}")
        return tokens

    def eval_cell(name: str) -> int:
        if name not in cells:
            raise ValueError(f"Unknown cell: {name}")
        cur_state = state.get(name, 0)
        if cur_state == 2:
            return memo[name]
        if cur_state == 1:
            raise ValueError(f"Circular reference involving {name}")

        raw = cells[name]
        if isinstance(raw, int) and not isinstance(raw, bool):
            memo[name] = raw
            state[name] = 2
            return raw

        text = str(raw).strip()
        if not text.startswith("="):
            val = int(text)
            memo[name] = val
            state[name] = 2
            return val

        state[name] = 1
        tokens = tokenize(text[1:])
        pos = 0

        def parse_expr() -> int:
            val = parse_term()
            while pos < len(tokens) and tokens[pos] in ("+", "-"):
                op = tokens[pos]
                nonlocal_pos_inc()
                rhs = parse_term()
                val = val + rhs if op == "+" else val - rhs
            return val

        def nonlocal_pos_inc() -> None:
            nonlocal pos
            pos += 1

        def parse_term() -> int:
            val = parse_factor()
            while pos < len(tokens) and tokens[pos] in ("*", "/"):
                op = tokens[pos]
                nonlocal_pos_inc()
                rhs = parse_factor()
                if op == "*":
                    val *= rhs
                else:
                    if rhs == 0:
                        raise ValueError("Division by zero")
                    val = int(val / rhs)
            return val

        def parse_factor() -> int:
            nonlocal pos
            if pos >= len(tokens):
                raise ValueError("Unexpected end of formula")
            tok = tokens[pos]
            if tok == "+":
                pos += 1
                return parse_factor()
            if tok == "-":
                pos += 1
                return -parse_factor()
            if tok == "(":
                pos += 1
                inner = parse_expr()
                if pos >= len(tokens) or tokens[pos] != ")":
                    raise ValueError("Mismatched parentheses")
                pos += 1
                return inner
            if tok.isdigit():
                pos += 1
                return int(tok)
            if tok[0].isalpha() or tok[0] == "_":
                pos += 1
                return eval_cell(tok)
            raise ValueError(f"Invalid factor: {tok!r}")

        res = parse_expr()
        if pos != len(tokens):
            raise ValueError("Trailing tokens in formula")
        state[name] = 2
        memo[name] = res
        return res

    return {cell: eval_cell(cell) for cell in cells}
