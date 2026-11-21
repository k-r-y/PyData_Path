def evaluate_sheet(cells: dict[str, int | str]) -> dict[str, int]:
    visiting: set[str] = set()

    def tokenize(expr: str) -> list[str]:
        tokens: list[str] = []
        i = 0
        while i < len(expr):
            ch = expr[i]
            if ch.isspace():
                i += 1
            elif ch in "+-*/()":
                tokens.append(ch)
                i += 1
            elif ch.isalnum():
                s = i
                while i < len(expr) and expr[i].isalnum():
                    i += 1
                tokens.append(expr[s:i])
            else:
                raise ValueError(ch)
        return tokens

    def eval_cell(name: str) -> int:
        if name not in cells:
            raise ValueError(name)
        if name in visiting:
            raise ValueError("Cycle")
        raw = str(cells[name]).strip()
        if not raw.startswith("="):
            return int(raw)
        visiting.add(name)
        toks = tokenize(raw[1:])
        pos = 0

        def expr() -> int:
            nonlocal pos
            v = term()
            while pos < len(toks) and toks[pos] in "+-":
                op = toks[pos]
                pos += 1
                r = term()
                v = v + r if op == "+" else v - r
            return v

        def term() -> int:
            nonlocal pos
            v = fac()
            while pos < len(toks) and toks[pos] in "*/":
                op = toks[pos]
                pos += 1
                r = fac()
                v = v * r if op == "*" else int(v / r)
            return v

        def fac() -> int:
            nonlocal pos
            t = toks[pos]
            if t == "-":
                pos += 1
                return -fac()
            if t == "(":
                pos += 1
                v = expr()
                pos += 1
                return v
            pos += 1
            return int(t) if t.isdigit() else eval_cell(t)

        ans = expr()
        visiting.remove(name)
        return ans

    return {k: eval_cell(k) for k in cells}
