def is_balanced(expr: str) -> bool:
    return (
        expr.count('(') == expr.count(')')
        and expr.count('[') == expr.count(']')
        and expr.count('{') == expr.count('}')
    )
