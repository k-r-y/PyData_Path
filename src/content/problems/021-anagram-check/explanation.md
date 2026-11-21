---
problemId: P021
solutions:
  - { file: solutions/reference.py, label: "Counter frequency equality in O(n)", time: "O(n)", space: "O(k)" }
  - { file: solutions/alt-sorted.py, label: "Sorted character lists", time: "O(n log n)", space: "O(n)" }
---
## Approach
Explanation: Stripping spaces and normalizing case ensures `"Dormitory"` and `"Dirty room"` compare identically, and comparing `Counter` dictionaries verifies exact multiplicity of every distinct symbol in `O(n)` time [src:python-wiki-timecomplexity]. Sorting characters works cleanly too for shorter inputs [src:python-tutorial].

## Common mistakes
- Comparing `set(a) == set(b)`, which drops duplicate counts (`"aab"` == `"abb"`).
- Forgetting to strip spaces or lowercase characters.

## Takeaways
- `Counter` equality handles multiset equivalence in linear time.

## Related
P032, P002, lesson A6
