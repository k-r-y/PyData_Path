def is_valid_sudoku(board: list[list[str]]) -> bool:
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == '.':
                continue
            if val in rows[r] or val in cols[c]:
                return False
            rows[r].add(val)
            cols[c].add(val)
    return True
