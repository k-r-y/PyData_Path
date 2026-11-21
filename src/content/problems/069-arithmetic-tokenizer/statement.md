Tokenize an arithmetic formula string into clean lexical tokens `list[str]`.

Write `tokenize_expr(expr: str) -> list[str]`:
- Supported single-character tokens: `+`, `-`, `*`, `/`, `(`, `)`.
- Number tokens group contiguous ASCII digits `0-9` with an optional single decimal point `.` (e.g. `"3.5"`, `"40"`).
- Ignore whitespace and return `[]` for blank strings; raise `ValueError` on invalid characters.
