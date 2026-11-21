def eval_postfix(tokens: list[str]) -> int:
    stack = []
    for tok in tokens:
        if tok in {"+", "-", "*", "/"}:
            b, a = stack.pop(), stack.pop()
            if tok == "+": stack.append(a + b)
            elif tok == "-": stack.append(a - b)
            elif tok == "*": stack.append(a * b)
            else: stack.append(a // b)
        else:
            stack.append(int(tok))
    return stack[-1]
