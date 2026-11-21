---
problemId: P007
solutions:
  - { file: solutions/reference.py, label: "Dynamic rule concatenation per integer", time: "O(n * r)", space: "O(n)" }
---
## Approach
Explanation: Instead of hardcoding `elif i % 3 == 0:` branches, iterate over `rules` for each `i` from `1` to `n` and collect every matching label in a string accumulator [src:python-tutorial]. When `matched` is empty, fall back cleanly to `str(i)` [src:automate-boring-stuff].

## Common mistakes
- Breaking out of the `rules` loop after the first match, which drops combined labels like `"AB"` at `15`.
- Using `range(n)` instead of `range(1, n + 1)`, starting at `0` and stopping early.

## Takeaways
- Parameterizing rules as data `(divisor, label)` eliminates brittle nested `if/elif` chains.

## Related
P003, P013, lesson A4
