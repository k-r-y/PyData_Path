---
problemId: P078
solutions:
  - { file: solutions/reference.py, label: "BFS over wildcard pattern adjacency buckets", time: "O(N * L^2)", space: "O(N * L^2)" }
---
## Approach
Explanation: Checking every pair of words for 1-character differences takes `O(N^2 * L)`, which bogs down large dictionaries [src:python-wiki-timecomplexity]. Indexing words under `"h*t"`, `"*ot"`, etc. lets BFS retrieve all 1-edit neighbors directly and clear visited buckets afterward to avoid re-scanning neighbors [src:python-tutorial].

## Common mistakes
- Returning node count `d + 1` (including `begin_word`) instead of transformation step count `dist`.
- Failing to handle `begin_word == end_word` (`0` steps) or clearing visited patterns causing redundant inner loops.

## Takeaways
- Wildcard buckets convert pairwise Hamming-distance graph construction into linear indexing.

## Related
P071, P063, lesson B8
