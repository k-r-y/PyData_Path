def check(args, actual, expected):
    (orig,) = args
    if not isinstance(actual, list) or len(actual) != 9:
        return False, "Expected a 9x9 matrix"
    digits = {str(d) for d in range(1, 10)}
    for r in range(9):
        if not isinstance(actual[r], list) or len(actual[r]) != 9:
            return False, f"Row {r} must have 9 entries"
        for c in range(9):
            if actual[r][c] not in digits:
                return False, f"Cell ({r},{c}) must contain '1'..'9', got {actual[r][c]!r}"
            if orig[r][c] != '.' and actual[r][c] != orig[r][c]:
                return False, f"Fixed clue at ({r},{c}) changed"
    for r in range(9):
        if set(actual[r]) != digits:
            return False, f"Row {r} incomplete"
    for c in range(9):
        if {actual[r][c] for r in range(9)} != digits:
            return False, f"Column {c} incomplete"
    for br in range(0, 9, 3):
        for bc in range(0, 9, 3):
            if {actual[br + dr][bc + dc] for dr in range(3) for dc in range(3)} != digits:
                return False, f"3x3 box ({br},{bc}) incomplete"
    return True
