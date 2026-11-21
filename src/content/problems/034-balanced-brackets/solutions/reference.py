def is_balanced(expr: str) -> bool:
    pairs = {')': '(', ']': '[', '}': '{'}
    openers = {'(', '[', '{'}
    stack: list[str] = []
    for ch in expr:
        if ch in openers:
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack
