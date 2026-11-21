def solve_sudoku(board: list[list[str]]) -> list[list[str]]:
    grid = [list(row) for row in board]
    rows = [0] * 9
    cols = [0] * 9
    boxes = [0] * 9
    empties: list[tuple[int, int]] = []

    for r in range(9):
        for c in range(9):
            ch = grid[r][c]
            if ch == '.':
                empties.append((r, c))
            else:
                bit = 1 << (int(ch) - 1)
                rows[r] |= bit
                cols[c] |= bit
                boxes[(r // 3) * 3 + (c // 3)] |= bit

    all_mask = (1 << 9) - 1

    def dfs(placed: int) -> bool:
        if placed == len(empties):
            return True
        best_idx = -1
        best_avail = 0
        best_count = 10
        for idx in range(placed, len(empties)):
            r, c = empties[idx]
            used = rows[r] | cols[c] | boxes[(r // 3) * 3 + (c // 3)]
            avail = (~used) & all_mask
            cnt = avail.bit_count()
            if cnt == 0:
                return False
            if cnt < best_count:
                best_count = cnt
                best_idx = idx
                best_avail = avail
                if cnt == 1:
                    break

        empties[placed], empties[best_idx] = empties[best_idx], empties[placed]
        r, c = empties[placed]
        b = (r // 3) * 3 + (c // 3)
        avail = best_avail
        while avail:
            lsb = avail & -avail
            avail ^= lsb
            d = lsb.bit_length()
            grid[r][c] = str(d)
            rows[r] |= lsb
            cols[c] |= lsb
            boxes[b] |= lsb
            if dfs(placed + 1):
                return True
            rows[r] ^= lsb
            cols[c] ^= lsb
            boxes[b] ^= lsb
            grid[r][c] = '.'

        empties[placed], empties[best_idx] = empties[best_idx], empties[placed]
        return False

    dfs(0)
    return grid
