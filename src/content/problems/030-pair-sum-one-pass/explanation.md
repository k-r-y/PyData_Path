---
problemId: P030
solutions:
  - { file: solutions/reference.py, label: "Single-pass dict lookup", time: "O(n) average", space: "O(n)" }
---
## Approach
Explanation: Instead of checking every earlier entry for each new ledger line, keep an index notebook (`seen`) of numbers already visited. For each `val` at `idx`, compute `need = target - val`. Checking whether `need` is already in the dictionary takes `O(1)` average time [src:python-wiki-timecomplexity]. Because you check `seen` *before* inserting `val`, `seen[need]` is strictly less than `idx`, guaranteeing `i < j`.

## Common mistakes
- Inserting `seen[val] = idx` before checking `need in seen`, which matches an element with itself (returning `(i, i)`) when `2 * val == target`.
- Using nested `for` loops (`O(n^2)`), which times out when the ledger has thousands of rows.
- Returning the values instead of their indices `(i, j)`.

## Takeaways
- Hash maps (`dict`) turn repeated linear searches for a complement into `O(1)` average lookups [src:python-wiki-timecomplexity].
- Checking before inserting naturally enforces distinct indices and `i < j` in one pass.

## Related
P015, P061, lessons A6 and B8
