---
problemId: P032
solutions:
  - { file: solutions/reference.py, label: "Canonical sorted-character key grouping", time: "O(n * k log k)", space: "O(n * k)" }
---
## Approach
Explanation: Hashing every word by its sorted character signature `"".join(sorted(word))` puts true anagrams in the same bucket while separating words that merely share distinct letters (such as `"aab"` vs `"abb"`) [src:python-tutorial]. Using `collections.defaultdict(list)` avoids repetitive key-existence checks and collects each bucket in `O(1)` amortized append time [src:python-wiki-timecomplexity].

## Common mistakes
- Using `sorted(set(word))` as the bucket key, which discards letter counts and wrongly merges `"aab"` with `"abb"`.
- Comparing every pair of words directly in `O(n^2)` instead of hashing by a canonical signature.

## Takeaways
- Mapping records to canonical hash keys turns pairwise equivalence checks into linear grouping.

## Related
P021, P031, lesson A6
