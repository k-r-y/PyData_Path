Implement a pure-Python CSV parser `parse_csv(text: str) -> list[list[str]]` **without importing the `csv` module**.

### Required Rules
- Handle standard commas, `\n` or `\r\n` row endings, and optional trailing newline at EOF.
- Inside `"..."` quoted fields, commas and embedded newlines are literal cell content (do NOT split the row/column on them).
- Inside quoted fields, two consecutive quotes `""` decode into a single literal `"` character.
