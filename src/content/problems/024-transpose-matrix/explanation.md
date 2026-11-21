---
problemId: P024
solutions:
  - { file: solutions/reference.py, label: "Explicit column-outer comprehension", time: "O(R * C)", space: "O(R * C)" }
  - { file: solutions/alt-zip.py, label: "Idiomatic zip(*matrix)", time: "O(R * C)", space: "O(R * C)" }
---
## Approach
Explanation: Output row `c` gathers element `c` from every original row `r` [src:python-tutorial]. Unpacking rows into `zip(*matrix)` handles column gathering in C speed cleanly, producing tuples which `list(col)` converts back into lists [src:python-stdtypes-docs].

## Common mistakes
- Assuming `cols == rows` (breaking rectangular matrices like `2x3` or `1x3`).

## Takeaways
- Track distinct `rows` and `cols` bounds whenever handling 2D tables.

## Related
P023, P037, lesson A7
