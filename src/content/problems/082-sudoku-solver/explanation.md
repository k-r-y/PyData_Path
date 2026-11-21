---
problemId: P082
solutions:
  - { file: solutions/reference.py, label: "Bitmask backtracking with Minimum Remaining Values (MRV)", time: "O(9^k) worst-case (ms with MRV)", space: "O(1)" }
---
## Approach
Explanation: Naive row-by-row Sudoku backtracking can stall on sparse boards where top-row cells have 8-9 guesses. Packing row/column/box occupancy into 9-bit integers and picking the empty square with the fewest valid candidates next (Minimum Remaining Values, MRV) forces forced cells immediately and prunes the search tree by orders of magnitude [src:python-tutorial]. Deep-copying `board` first keeps caller inputs untouched [src:python-wiki-timecomplexity].

## Common mistakes
- Scanning all 9 rows/cols/boxes linearly from scratch inside every recursive frame instead of tracking `rows/cols/boxes` bitmasks or sets.
- Mutating the input list directly when callers expect immutability.

## Takeaways
- Minimum Remaining Values (choose the most constrained variable first) dramatically speeds up backtracking search.

## Related
P043, P080, lesson B8
