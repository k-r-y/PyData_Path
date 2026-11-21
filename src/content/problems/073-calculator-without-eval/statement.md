Implement a full arithmetic expression evaluator `evaluate_expr(expr: str) -> int` **without using `eval()` or `exec()`**.

### Supported Features
- Non-negative integers, whitespace, parentheses `()`, unary `-` / `+`, and binary left-associative `+`, `-`, `*`, `/`.
- Standard precedence: parentheses first, then `*`/`/`, then `+`/`-`.
- Division truncates toward zero (`int(a / b)`, so `-7 / 2 == -3`).
