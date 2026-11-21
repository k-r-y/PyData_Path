---
problemId: P028
solutions:
  - { file: solutions/reference.py, label: "Modulo 12 hour normalization with AM/PM split", time: "O(1)", space: "O(1)" }
---
## Approach
Explanation: Using `h < 12` cleanly partitions midnight through `11:59` as `AM` and `12:00` through `23:59` as `PM` [src:python-tutorial]. The expression `h % 12 or 12` maps `0` and `12` cleanly to `12` while preserving `1..11`, and `f"{m:02d}"` ensures minutes remain zero-padded [src:python-stdtypes-docs].

## Common mistakes
- Checking `h > 12` instead of `h >= 12` for PM, mislabeling `12:00` noon as `12:00 AM`.
- Leaving `0 % 12 == 0` as `"0:15 AM"` instead of `"12:15 AM"`.

## Takeaways
- `h % 12 or 12` handles both midnight (`0`) and noon (`12`) in one concise expression.

## Related
P051, lesson A3
