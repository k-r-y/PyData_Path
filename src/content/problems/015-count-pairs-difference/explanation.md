---
problemId: P015
solutions:
  - { file: solutions/reference.py, label: "Counter lookup in O(n)", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Using `Counter(nums)` groups identical numbers so you never inspect `i < j` pairs quadratically [src:python-tutorial]. When `k > 0`, multiplying `freq[x] * freq[x + k]` counts each valid pair exactly once from the smaller endpoint `x` upward. When `k == 0`, any value appearing `c` times contributes `c * (c - 1) // 2` distinct index pairs [src:python-wiki-timecomplexity].

## Common mistakes
- Treating `k == 0` with `freq[x] * freq[x]` instead of combinations `c * (c - 1) // 2` (pairing an index with itself and double-counting).
- Nested loops taking `O(n^2)` on 15,000 items.

## Takeaways
- Hash frequency counts replace `O(n^2)` pair searches with `O(n)` arithmetic.

## Related
P030, P011, lessons A6 and B8
