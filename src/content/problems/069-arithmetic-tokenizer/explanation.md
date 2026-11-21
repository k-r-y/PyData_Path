---
problemId: P069
solutions:
  - { file: solutions/reference.py, label: "Single-pass index-driven lexical scanner", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Expressions like `"10+20*(3-1)"` do not separate tokens by spaces, so whitespace splitting fails [src:python-tutorial]. Advancing an explicit cursor `i` handles single-character operators and greedy multi-character numeric scans cleanly in `O(n)` time while rejecting malformed decimals such as `"1.2.3"` or stray symbols [src:python-stdtypes-docs].

## Common mistakes
- Splitting on spaces instead of scanning characters, leaving `"((1+2))"` unbroken.
- Emitting each digit `'1', '0'` individually instead of scanning contiguous numeric runs.

## Takeaways
- Separating lexical tokenization from expression evaluation simplifies both calculator and parser pipelines.

## Related
P073, P053, lesson A3
