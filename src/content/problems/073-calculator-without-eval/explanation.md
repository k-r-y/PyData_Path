---
problemId: P073
solutions:
  - { file: solutions/reference.py, label: "Recursive descent parser across precedence tiers", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Recursive descent directly encodes operator precedence in three grammar layers: `parse_expr` handles low-precedence `+` and `-`, `parse_term` handles higher-precedence `*` and `/`, and `parse_factor` resolves parentheses, unary signs, and integers [src:think-python]. Every division uses `int(a / b)` so negative quotients truncate toward zero rather than flooring away from zero [src:python-tutorial].

## Common mistakes
- Evaluating strictly left-to-right without precedence (`3 + 5 * 2` -> `16` instead of `13`).
- Using Python `//` division instead of `int(a / b)` on negative operands.
- Ignoring unary `-` at the start or directly inside `-(...)` / `10 - -5`.

## Takeaways
- Grammar-stratified recursive descent mirrors arithmetic precedence cleanly without regex hacks or `eval()`.

## Related
P053, P069, lesson A5
