def eval_postfix(tokens: list[str]) -> int:
    stack = []
    for tok in tokens:
        if tok in {"+", "-", "*", "/"}:
            a, b = stack.pop(), stack.pop()
            if tok == "+": stack.append(a + b)
            elif tok == "-": stack.append(a - b)
            elif tok == "*": stack.append(a * b)
            else: stack.append(int(a / b))
        else:
            stack.append(int(tok))
    return stack[-1]
