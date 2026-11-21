---
problemId: P013
solutions:
  - { file: solutions/reference.py, label: "Single-pass character class checks", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Using `any(...)` generator expressions checks each requirement clearly and short-circuits on match [src:python-tutorial]. Rejecting any character with `ch.isspace()` prevents accidental spaces, tabs, or newlines in passwords [src:python-stdtypes-docs].

## Common mistakes
- Forgetting to reject spaces/whitespace characters.
- Checking `not pw.isalnum()` for symbols, which accidentally counts spaces or invalid punctuation as valid symbols.

## Takeaways
- `any()` over generator expressions keeps multi-rule validation readable and short-circuiting.

## Related
P006, P064, lesson A4
