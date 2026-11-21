def evaluate_sheet(cells: dict[str, int | str]) -> dict[str, int]:
    memo: dict[str, int] = {}

    def eval_cell(name: str) -> int:
        if name in memo:
            return memo[name]
        raw = str(cells[name]).strip()
        if not raw.startswith("="):
            return int(raw)
        expr = raw[1:]
        tokens = expr.replace("+", " + ").replace("-", " - ").split()
        val = int(tokens[0]) if tokens[0].lstrip("-").isdigit() else eval_cell(tokens[0])
        memo[name] = val
        return val

    return {k: eval_cell(k) for k in cells}
