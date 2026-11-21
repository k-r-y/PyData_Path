def parse_csv(text: str) -> list[list[str]]:
    if not text:
        return []
    rows: list[list[str]] = []
    row: list[str] = []
    cell: list[str] = []
    in_quotes = False
    i = 0
    n = len(text)

    while i < n:
        ch = text[i]
        if in_quotes:
            if ch == '"':
                if i + 1 < n and text[i + 1] == '"':
                    cell.append('"')
                    i += 2
                    continue
                in_quotes = False
            else:
                cell.append(ch)
        else:
            if ch == '"':
                in_quotes = True
            elif ch == ',':
                row.append("".join(cell))
                cell = []
            elif ch == '\r' or ch == '\n':
                if ch == '\r' and i + 1 < n and text[i + 1] == '\n':
                    i += 1
                row.append("".join(cell))
                rows.append(row)
                row = []
                cell = []
            else:
                cell.append(ch)
        i += 1

    if cell or row:
        row.append("".join(cell))
        rows.append(row)
    return rows
