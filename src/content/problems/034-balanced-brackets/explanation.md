---
problemId: P034
solutions:
  - { file: solutions/reference.py, label: "LIFO stack with closing-to-opening map", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Think of stacked trays: the last bracket opened MUST be the very next bracket closed [src:python-tutorial]. Using `list.append` and `list.pop` gives `O(1)` stack operations, so scanning a long expression takes `O(n)` total time [src:python-wiki-timecomplexity]. At the end of the string, the stack must be empty to rule out unclosed openers.

## Common mistakes
- Counting opening vs closing brackets without tracking nesting order (wrongly accepting `")("` or `"([)]"`).
- Returning `True` immediately after the loop without checking `len(stack) == 0`.
- Raising `IndexError` when popping from an empty stack on an early closing bracket.

## Takeaways
- Whenever pairs must nest inside out (brackets, tags, function call frames), use a LIFO stack.

## Related
P053, P073, lesson A6
