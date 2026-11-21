---
problemId: P033
solutions:
  - { file: solutions/reference.py, label: "Single-pass run scanner and digit-span decoder", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Compressing works by tracking `cur` and `count` as you move down the stream, flushing `f"{cur}{count}"` after every run change and once more after the loop ends. Decoding cannot assume fixed two-character pairs because counts >= 10 span multiple digits; using a nested `while` loop that advances while `encoded[i].isdigit()` collects the complete decimal count [src:python-stdtypes-docs].

## Common mistakes
- Stepping `range(0, len(encoded), 2)` during decoding, which breaks on counts `>= 10` like `"W12X1"`.
- Forgetting to flush the final run after the loop ends in `rle_encode`.

## Takeaways
- Always consume variable-width numbers with a digit scanner rather than assuming single characters.

## Related
P005, P048, lesson A3
