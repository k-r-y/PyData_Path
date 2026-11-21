---
problemId: P061
solutions:
  - { file: solutions/reference.py, label: "Sort + outer loop + deduplicated two pointers", time: "O(n^2)", space: "O(n)" }
---
## Approach
Explanation: Sorting puts equal numbers next to each other and brings ordered search structure to the remaining array [src:python-tutorial]. Fixing `arr[i]` reduces the inner check to finding two pointers `(lo, hi)` summing to `-arr[i]` in linear time, while skipping adjacent duplicates guarantees unique triplets without nested `O(n^3)` loops [src:python-wiki-timecomplexity].

## Common mistakes
- Failing to skip duplicate `arr[i]` or duplicate `arr[lo]`/`arr[hi]`, emitting repeated triplets like `[[-1, 0, 1], [-1, 0, 1]]`.
- Writing a naive triple nested loop `O(n^3)`.

## Takeaways
- Sorting + two pointers lowers k-sum complexity by an order of magnitude (`O(n^3) -> O(n^2)`).

## Related
P030, P015, lesson B8
