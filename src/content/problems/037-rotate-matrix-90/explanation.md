---
problemId: P037
solutions:
  - { file: solutions/reference.py, label: "Direct coordinate mapping (n-1-r, c)", time: "O(n^2)", space: "O(n^2)" }
  - { file: solutions/alt-transpose-reverse.py, label: "Transpose via zip then reverse rows", time: "O(n^2)", space: "O(n^2)" }
---
## Approach
Explanation: Every column `c` read bottom-to-top (`matrix[n - 1 - r][c]`) becomes row `c` of the 90-degree clockwise result [src:python-tutorial]. Equivalently, `zip(*matrix)` transposes columns into rows and slicing `[::-1]` reverses each new row horizontally.

## Common mistakes
- Reversing in the wrong order (`[r][n-1-c]`), which rotates 90 degrees *counterclockwise* instead of clockwise.

## Takeaways
- Check two corners on a `2x2` test (`[[1,2],[3,4]] -> [[3,1],[4,2]]`) to catch clockwise vs counterclockwise inversions immediately.

## Related
P024, P044, lesson A7
