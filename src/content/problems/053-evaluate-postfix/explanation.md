---
problemId: P053
solutions:
  - { file: solutions/reference.py, label: "LIFO operand stack with int(a / b) zero truncation", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Scanning RPN left-to-right never needs precedence rules: the last two pushed numbers become the left and right operands (remembering first pop is the *right* operand `b` and second pop is *left* operand `a`) [src:python-tutorial]. Using `int(a / b)` truncates division cleanly toward zero unlike Python's floor division `//`, which rounds negative quotients toward negative infinity [src:python-stdtypes-docs].

## Common mistakes
- Popping `a, b = stack.pop(), stack.pop()` in reverse order, flipping `10 - 3` into `3 - 10`.
- Using `//` on negative numbers (`-7 // 2 == -4` instead of `-3`).

## Takeaways
- `int(a / b)` performs exact zero-truncating integer division cleanly in Python for normal integer ranges.

## Related
P034, P073, lesson A6
