Build `evaluate_sheet(cells: dict[str, int | str]) -> dict[str, int]` to compute resolved integer values for every cell in a spreadsheet dictionary **without using `eval()`**.

### Specification
- Integer literals or numeric strings like `"-12"` evaluate to `int`.
- Formulas begin with `"="`, supporting cell references (alphanumeric names like `A1`, `Z10`, `C150`), integers, parentheses `()`, unary `+`/`-`, and binary `+`, `-`, `*`, `/` (integer division truncating toward zero via `int(a / b)`).
- Forward references and shared sub-expressions must work and be memoized cleanly.
- Cycles (direct or multi-hop), unknown cell references, or division by zero must raise `ValueError`.
